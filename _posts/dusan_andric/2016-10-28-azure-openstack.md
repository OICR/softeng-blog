---
layout: post
title:  "Another cloud in the sky: Azure in a Unix shop"
breadcrumb: true
author: dusan_andric
date: 2016-10-28
categories: dusan_andric
tags:
    - Azure
    - Openstack
    - Cloud
    - Microsoft
teaser:
    info: A guide for Unix shops on how to setup the Azure Storage Emulator running on your team's Openstack cloud.
    image: dusan_andric/azure/azure-logo.jpg
header: 
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---

## Introduction
Microsoft Azure continues to gain popularity and as a result many teams are now working to leverage Microsoft's cloud offering for services and infrastructure. A particular point of interest is Azure Storage. 
One question that gets asked is how do I evaluate and develop against it? An equally important question that gets asked (or should get asked) is how to I test my integrations and services? 
And finally, will I be billed for the traffic/storage/compute while developing or running integration tests?

Here Microsoft has you covered. They provide an Azure Storage Emulator that can be run locally so you can simplify your development and testing. 

There is a catch however, the emulator only runs on Windows. That brings us to this guide, which should show a way forward.

## The How-To

### Openstack & Windows

Those of you running an Openstack cloud are probably wondering how this is going to work. Thankfully a company 
by the name of Cloudbase Solutions has solved this problem. They specialize in bringing the worlds of Openstack and Windows together. 
Even better they provide a ready to use Windows Server 2012 Evaluation guest image. 

[Go ahead and get the image from here.](https://cloudbase.it/windows-cloud-images/)

You'll want to create a new image on openstack using the file provided by Cloudbase (This could take a while): 

<center>
  <figure style="width: 40%;">
      <img src="{{site.urlimg}}dusan_andric/azure/openstack.png"/>
      <figcaption>Openstack Image Creation Dialogue</figcaption>
  </figure>
</center>

When ready, you can launch a new instance using your new Windows Server image. Once the instance has finished spawning,
you can view the instance console. You should soon see the cloudbase-init tool doing its magic.

<figure>
    <img src="{{site.urlimg}}dusan_andric/azure/console1.png" />
    <figcaption>Cloudbase-init</figcaption>
</figure>

Soon it will ask you about changing the Administrator password before logging in. 

<figure>
    <img src="{{site.urlimg}}dusan_andric/azure/console2.png" />
    <figcaption>Admin setup.</figcaption>
</figure>

Congratulations, you now have a Windows Server instance running in your Openstack with minimal effort.
If your daily driver is a Mac, I highly recommend downloading Microsoft Remote Desktop for working with the Windows instance.
You can find it on the App Store. 

### Azure Setup

First thing you'll want to install is SQL Server Express LocalDB. It is required by the Storage Emulator. [You can find it here.](https://www.microsoft.com/en-us/sql-server/sql-server-editions-express)

Next, download the standalone installer for the emulator by following the link in the [Azure Storage Emulator documentation.](https://azure.microsoft.com/en-us/documentation/articles/storage-use-emulator/)

Once everything is installed you can start the storage emulator by searching for it from the start screen. It should open up a new cmd window. You can then verify that it is running:

<figure>
    <img src="{{site.urlimg}}dusan_andric/azure/azure1.png" />
    <figcaption>Azure Storage Emulator up and running.</figcaption>
</figure>

### Networking

***This step is important***. Currently the Azure Storage Emulator is limited to only accepting connections from localhost by default. 
This can be changed by editing the config file, but then the storage server will become unavailable localy from the Windows instance. 
Also it appears that storage clients when run with emulation mode set to true will also attempt to connect to a storage service running locally. 

So for the moment port forwarding will be our workaround. For this example my only concern will be the blob storage. 

On the windows server we can use the `netsh` utility to create our port foward.

~~~powershell
netsh 1337 127.0.0.1 10000
~~~

You can verify the result of the command:

<figure>
    <img src="{{site.urlimg}}dusan_andric/azure/azure2.png" />
    <figcaption>netsh output in powershell.</figcaption>
</figure>

On your unix machine that needs to connect as a client, you can do something like the following:

~~~bash
ssh -L 10000:windows-server:1337 me@localhost
~~~

I'll be the first to say that this is not ideal, however it does work.

### Verify

Now that the setup is done, let's actually do something with the emulator in the form of a simple test. 

First thing I'm going to do is upload an image to the blob storage using the Azure Storage Explorer.
The tool is cross platform and very handy. 
[You can download it here.](http://storageexplorer.com)

From the UI I uploaded an image:

<figure>
    <img src="{{site.urlimg}}dusan_andric/azure/azure3.png" />
    <figcaption>Storage Explorer in action.</figcaption>
</figure>

From my local machine I then run this little python script to download the image.

~~~python
from azure.storage.blob import BlockBlobService

block_blob_service = BlockBlobService(is_emulated=True,
                                      account_name='devstoreaccount1',
                                      account_key='Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==')

img_blob = block_blob_service.get_blob_to_bytes(container_name='data', blob_name='OICR2logo.png')
open('OICR2logo.png', mode='wb').write(img_blob.content)
~~~

And there it is:

<figure>
    <img src="{{site.urlimg}}dusan_andric/azure/download.png" />
    <figcaption>Successful download of image.</figcaption>
</figure>

## Conclusion

The initial use case for the Azure Storage Emulator was clearly for it be run from your local work station for the purpose of running tests and aiding development. However with two easy commands to setup some port forwarding, one from the Windows server, and one from your Unix client, you can make requests against a remote emulator. 

Microsoft products and services are becoming a little less scary every day for us in the Unix world, and while yes the occasional kludge is required, things are looking brighter. 

As they continue to open source useful libraries and tools and continue their push on platform independence with projects like
.NET Core, the friction those of us encountered integrating their services in ages past should vanish. 

With things like Spark and Hadoop now being offered through Azure, the sky's the limit. 
