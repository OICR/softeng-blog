
---
layout: post
title:  "Helm for Kuberenetes, Lessons Learned"
breadcrumb: true
author: bashar_allabadi
date: 2021-03-31
categories: bashar_allabadi
tags:
    - Devops
    - Helm
    - Helm Charts
    - Best Practice
teaser:
    info: Team's experience with helm, and the lessons we learnd 
    image: bashar_allabadi/Helm.png
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---

## Background

We started the ICGC ARGO project (https://platform.icgc-argo.org/) in mid 2019, and it's still on going. so it's relatively new project and the team decided to adopt and use Kubernetes (https://kubernetes.io/) for the first time. 

Kuberenetes is a very powerful and the defacto container orcherstrator tool at this time (not sure if tool is the right word to describe this beast!). K8s comes with a new set of challanges as any other new abstraction layer we introduce in software building process, and one of these challanges is the management of the Resource files we need to create, update and manage to communuicate with K8s on how we want to deploy, scale, control storage and conenct our containers together and monitor their needs and health.

to easily author and maintain these Resource files, which are in YAML, K8s has a package manager, called Helm (https://helm.sh/). Helm is the defacto package manager for K8s and is widely adopted by the indudstry. Briefly, what Helm does is to allow users to create templated YAML files and provide a way to render these templates based on a set of values so that we can reuse these resources and package them in one coherent self contained package (called Chart) and it communicates with K8s APIs to deploy these resrouces after rendering the templates with the provided values (a Release) and gives the users the ability to track the history of their release.

For examples on our charts, you can visit this Repostiory: https://github.com/overture-stack/helm-charts

## Using Helm

Helm is another abstraction layer and comes with a learning curve, not necessarily steep one, but still there are few gotchas 
To use helm as deployment tool for charts we needed to:
- Have a Helm tool script.
- Create charts and host them:
  -  to host the charts, we have the charts in their own repository and we use github pages as way to host them publicly, it's a quick and easy way to get up and running quickly, see https://github.com/overture-stack/charts-server.
- write the script that will call the helm tool and pass to it the information it needs to deploy the chart
- Run the deployment script when needed.

In each of these steps we had experiences and lessons that I'll share in this blog.


## Creating Charts
You can get the scaffold for a chart using `helm create <chart name>`
after that you need to start customizing the chart files to get what you need.

### Understand the generated chart
- Read the templates 
- Understand the template helpers auto created
- understand each template and how it will get it's values

### YAML is not Typed
Remember YAML is not typed but if you pass an string where integer is expected like ports for example, on deployment time you will get a cryptic error from K8s unfortunately the errors are hard to read so keep this in mind when providing values and debugging issues related to types.

### Bundled Charts
Helm allows you to specifiy dependencies of your chart and it will bundle those together, this approach has Pros and Cons, but usually I'd say we try to avoid it because if the charts diverge during their life time in terms of operation it can become hard to maintain, so make sure you are aware of the impact of bundling the charts as dependencies, and only do it when needed.

#### Stateful charts 
An example of a case where we bundled charts and learned that it was bad, is when we bundled postgres db with our microservices charts, although it's more convenient to deploy them in one shot, it became harder to maintain.

Stateful applications like DBs have different than stateless applications (microservices):
    - they need storage and storage managment and migrations before deleting a release. 
    - they also store data like passwords in their storage and since it's insecure to keep these values plain in the helm files, we had to resort to `--reuse-values` which also affected our stateless service
    - they don't need frequent updates as microservice, usually stateful sets are 3rd party charts that are stable and rarely touched

So in summary their operations are different from stateless services.

### Passing Application configurations
To pass application configuration, we use Environment variables as recommended by the 12 factor application principles (https://12factor.net/) 
there are different approaches to do this with helm:
- You can add your env vars as an array in the deployment file itself 
```
    spec:
      serviceAccountName: {{ include "ego.fullname" . }}
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          env:
            - name: SERVER_PORT
              value: "8081"
```

- Or you can create a generic non hardcoded way to render your env vars:
```
    spec:
      serviceAccountName: {{ include "ego.fullname" . }}
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          env:
{{- if .Values.extraEnv }}
  {{ range $key, $value := .Values.extraEnv }}
            - name: {{ $key }}
              value: {{ $value | quote }}
  {{- end }}
{{- end }}

```

My experience is that the 2nd approach is easier to maintain and has less overhead because env vars are added and removed often and in the second way there is no need to change anything in the chart itself, it is dynamic enough do that.

### Chart per service vs Common chart
We started creating a chart per service but after sometime it was clear that for the majority of microservices they all looked the same, regardless of the technology of the service, the charts looked the same. So I introduced a generic chart called Stateless-svc and it allows users to configure and customize it only through providing the values file. This allows us to:

- enforce common practices like labeling, security, adding extra common resources without having to go over all charts
- maintain only 1 chart for many microservices.
- easier to automate and build processes around since there are no special cases.
- consistency in configuring charts and estabilishing conventions.

Some charts are more complicated and may not fit in a generic chart, However, for the majority of services, it will save you alot of time.


### Secrets Management

### Operator Pattern

### Security
#### Non root containers

### Chart version vs App version



## Deploying Charts
### Auto deploy (aka Continuous deployment)
### Manual deploy 
### Helm Reuse-values 
### 


## Automating Deployments
### Jenkins Pipelines
### Terraform 

