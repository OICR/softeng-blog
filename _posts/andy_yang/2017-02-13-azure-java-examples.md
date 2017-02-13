---
layout: post
title:  "Azure Blob Storage - Java Examples"
breadcrumb: true
author: andy_yang
date: 2017-02-13
categories: andy_yang
tags:
    - Azure
    - Java
    - Cloud
    - Microsoft
teaser:
    info: Examples in Java for working with Azure Blob Storage
    image: andy_yang/azure/azure-logo.jpg
header: 
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---

## Introduction
The "ICGC In The Cloud" initiative makes a large genomic database available to cancer researchers in cloud computing environments. The size of ICGC datasets has typically placed a heavy burden on research groups, in terms of transfer time and computing resources. Cloud computing helps alleviate this burden by creating an environment where processing power and data are kept in close proximity to each other. Researchers no longer have to maintain their own clusters of servers and spend time downloading raw data. Instead, they can focus on performing their actual research.

Currently, over 750 TB of genomic data is hosted between Amazon Web Services and an OpenStack environment called Cancer Genome Collaboratory. Recently, Microsoft has also expressed an interest in working with ICGC to host genomic data. 

Both OpenStack's Ceph ObjectStore and AWS S3 use the S3 API; we are able to essentially run a single code base against both repositories. Microsoft's Azure Blob Storage is a different beast altogether however, and I recently became familiar with it in order to adapt our Storage system to use Azure as a backing repository.


## Background

### Architecture

<center>
  <figure style="width: 85%;">
      <img src="{{site.urlimg}}/andy_yang/azure/storage-topology.png"/>
      <figcaption>Storage System Topology</figcaption>
  </figure>
</center>

At a high level, our system is comprised of 3 components. In addition to the repository/object store such as AWS S3, Ceph or Azure Blob Storage, we have a Storage Server component, as well as a Storage Client.

We introduce a middle tier Storage Server component that works in concert with the Client in order to restrict access to the data. Our genomic data is private and subject to tight control. The underlying repository is locked-down (i.e., no anonymous/direct outside access).

The Storage Server component is primarily concerned with determining permissions and generating upload/download URL's. Once the URL's are generated, all actual transfers from the repository are initiated and managed directly from the client. The Storage Server is no longer involved.

The Storage Client's primary function is to facilitate authorization and access to the data stored in the repository. However, it also provides additional functionality like high-performance upload/download operations (concurrent connections as well as resumption of partial downloads), "slicing" out specified ranges of genomic data, and mounting data files as a read-only Filesystem in Userspace (FUSE).

### Design Considerations

One of our design philosophies was to avoid dissemination of repository access keys, saving us from having to manage user provisioning in the Object Store itself. In other words, every time we enroll a new researcher who wants to access the data, we don't want to have to create a user id/key in each repository for that user. We are able to manage the secret key and password in one location.

The mechanism for this is a Pre-Signed URL. Azure calls this a Shared Access Signature (SAS). This is a URI that is signed with the authorizing credentials, but usable by anyone else. These URI's can be expired after a set period of time, and can be used by any REST client.

SAS URI's can be generated for Containers as well as for individual Blobs, but our system hides all details of Containers from its users; and access is granted to Blobs individually.

## Microsoft's Java SDK

<http://azure.github.io/azure-storage-java/>

Not to be confused with the similarly-named <https://github.com/Azure/azure-sdk-for-java>. This latter project is the Management API - to be used for managing and automating actions in an Azure environment. For basic use of Blob Storage, it's the Azure Storage Client API (version 4.4.0 as of this writing) you want.

### The Model

The CloudStorageAccount and CloudBlobClient classes primarily establish your credentials and allow you to obtain references to a CloudBlobContainer. Inside the Container are CloudBlockBlobs. 

The container has a BlobContainerPermissions object which contains any SharedAccessBlobPolicies defined for it. 

<center>
  <figure style="width: 85%;">
      <img src="{{site.urlimg}}/andy_yang/azure/azure-blob-classes.png"/>
      <figcaption>Class Model</figcaption>
  </figure>
</center>

The CloudBlockBlob knows how to generate a SAS URI for itself, combining the Container permissions along with another SharedAccessBlobPolicy that you use to define the lifespan of the SAS URI.

From the client side, with an SAS, you can work with a CloudBlockBlob directly without all the boilerplate. In generating the SAS URI, the Storage Service takes care of all those details.

However, you don't even have to use the Java SDK on the client side - any REST clients can issue a GET for the SAS, optionally specifying a range.


### Code Examples

Here are some Java 8 examples extracted from the code developed for our own needs.

This is the initial set up boilerplate. The account name and account key credentials are used to construct a CloudBlobClient instance.

~~~java
  String storageConnectionString =
      "DefaultEndpointsProtocol=https;"
      + "AccountName=oicrexample;"
      + "AccountKey=<account-key>";

  CloudStorageAccount account = CloudStorageAccount.parse(storageConnectionString);

  // Create a blob service client
  CloudBlobClient blobClient = account.createCloudBlobClient();

~~~

The CloudBlobClient gives you access to the Containers contained in the Storage Account.

~~~java
  CloudBlobContainer container = blobClient.getContainerReference(name);
  if (!container.exists()) {
    System.out.println(String.format("Container '%s' not found", name));
    // Note: it's perfectly acceptable to container.create() if it doesn't already exist,
    // but you would probably be want to always container.createIfNotExist() if this is 
    // a common occurrence.
    System.exit(1);
  }
~~~

While you can generate standlone SAS URL's directly at this point, the recommendation is to first define Stored Access Policies on the container. These represent a common set of permissions applied to all contents within the container. The most obvious benefit to this is that by changing the Stored Access Policy, the changes get applied automatically to every SAS in the container. This beats having to revoke every SAS you've ever created, individually.

~~~java
  BlobContainerPermissions permissions = new BlobContainerPermissions();

  // define a Read-only base policy for downloads
  SharedAccessBlobPolicy readPolicy = new SharedAccessBlobPolicy();
  readPolicy.setPermissions(EnumSet.of(SharedAccessBlobPermissions.READ));
  permissions.getSharedAccessPolicies().put("DownloadPolicy", readPolicy);

  // define a base policy that allows writing for uploads
  SharedAccessBlobPolicy writePolicy = new SharedAccessBlobPolicy();  
  writePolicy.setPermissions(EnumSet.of(SharedAccessBlobPermissions.READ, SharedAccessBlobPermissions.WRITE, SharedAccessBlobPermissions.CREATE));
  permissions.getSharedAccessPolicies().put("UploadPolicy", writePolicy);

  container.uploadPermissions(permissions);
~~~

And then you can finally get to generating the SAS for a given object. Note that to account for variances in system clocks, Microsoft recommends you back date your SAS start time by 15 minutes.


~~~java
  // define rights you want to bake into the SAS
  SharedAccessBlobPolicy itemPolicy = new SharedAccessBlobPolicy();
  
  // calculate Start Time
  LocalDateTime now = LocalDateTime.now();
  // SAS applicable as of 15 minutes ago
  Instant result = now.minusMinutes(15).atZone(ZoneOffset.UTC).toInstant();
  Date startTime = Date.from(result);

  // calculate Expiration Time
  now = LocalDateTime.now();
  result = now.plusDays(7).atZone(ZoneOffset.UTC).toInstant();
  Date expirationTime = Date.from(result);

  itemPolicy.setSharedAccessStartTime(startTime);
  itemPolicy.setSharedAccessExpiryTime(expirationTime);

  String blobKey = <key to your blob> 
  
  // get reference to the Blob you want to generate the SAS for:
  CloudBlockBlob blob = container.getBlockBlobReference(blobKey);
  
  // generate Download SAS
  String sasToken = blob.generateSharedAccessSignature(itemPolicy, "DownloadPolicy");
  // the SAS URL is actually concatentation of the blob URI and the generated token:
  String sasUri = String.format("%s?%s", blob.getUri(), sasToken);
~~~

Note that for uploads, you would need to do the following:

~~~java
  // generate Upload SAS
  String sasToken = blob.generateSharedAccessSignature(itemPolicy, "UploadPolicy");
~~~

because the "DownloadPolicy" Shared Access Policy only grants READ access.


### Whew, Now What?

This whole process has simply been to authenticate you as someone who is authorized to use/control a Blob Storage Container, and then to delegate some of your rights via a Shared Access Signature. Anyone with this SAS URI will be able to access the Blob without knowing your storage access key or secret. To actually download the Blob, this is all they will need to do:

~~~java
  URI url = new URI(sasUri);
  CloudBlockBlob blob = new CloudBlockBlob(url);
  blob.downloadToFile("path/to/save/download");
~~~

And with the SAS URI you generated with the _UploadPolicy_, uploading a file looks, unsurprisingly, like this:

~~~java
  URI url = new URI(sasUri);
  CloudBlockBlob blob = new CloudBlockBlob(url);
  blob.uploadFromFile("path/to/file/to/upload");
~~~

### Concurrent Uploads

All files larger than 64 MB are automatically stored as something called a Block Blob. Every block is uploaded to Azure and stored individually, to be logically combined and ordered once all the blocks have been successfully sent. Azure Blob Storage has a maximum block size of 4 MB. Considering a single BAM alignment file can be more than 415 GB in size, we're dealing with a _lot_ of blocks. (In fact, at this time, ~~Azure can't even store the larger BAM's *at all*. They promise us that's changing though.~~)

The point of all this, is that uploading one of our alignment files would take a really long time, if we had to upload one 4 MB block at a time sequentially. So, Microsoft's Java SDK allows us to send blocks up to Azure *concurrently*:

~~~
  // specify number of parts to upload at the same time
  int numConcurrent = 10;	// we actually set ours to 20-30
  BlobRequestOptions options = new BlobRequestOptions();
  options.setConcurrentRequestCount(numConcurrent);

  blob.uploadFromFile("path/to/file/to/upload", 
                      AccessCondition.generateEmptyCondition(), 
                      options, 
                      new OperationContext());
~~~
Under the covers, Microsoft has already taken care of managing the block lists for the file. 

##### Update: 

Microsoft has just rolled-out Large Block Blob support as of the end of 2016 ([see announcement here](https://azure.microsoft.com/en-us/blog/general-availability-larger-block-blobs-in-azure-storage/)). Files can now be up to 4.77 TB each and individual blocks can be 100 MB (104,857,600 bytes). The Java Client library supporting this feature is version 5.0.0.

### Conclusion

While our Storage System had been architected based solely on Amazon's S3 API, adapting our logic to use Azure Blob Storage went remarkably smoothly. The one notable difference was the mechanism for tracking parts being uploaded concurrently. Azure's CloudBlockBlob.uploadFromFile() method abstracts the whole upload process, including parallel uploads. This is extremely convenient, but it does not include resumption of interrupted transfers. We will have to manage the details of the Block List ourselves if we want to provide this feature.

Overall however, it's a well thought out API that I found very intuitive and easy to work with.

### References

Myers, Tamra. [Using Shared Access Signatures (SAS)](https://docs.microsoft.com/en-us/azure/storage/storage-dotnet-shared-access-signature-part-1)  
October 17, 2016

Mantri, Guarav. [Revisiting Windows Azure Shared Access Signature](http://gauravmantri.com/2013/02/13/revisiting-windows-azure-shared-access-signature/)  
February 13, 2013 

Shahan, Robin. [Azure Blob Storage Part 9: Shared Access Signatures](https://www.simple-talk.com/cloud/platform-as-a-service/azure-blob-storage-part-9-shared-access-signatures/)  
March 12, 2015




