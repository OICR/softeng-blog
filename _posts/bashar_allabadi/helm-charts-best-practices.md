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
    image: bashar_allabadi/helm.svg
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---


## Background

We started the [ICGC ARGO project](https://platform.icgc-argo.org/) in mid 2019, and it's still on going. It's still a relatively new project and the team decided to adopt and use [Kubernetes](https://kubernetes.io/) for the first time. 

Kuberenetes, K8s for short, is a very powerful and the defacto container orchestration tool at this time (not sure if tool is the right word to describe this beast!). K8s comes with a new set of challenges as any other new abstraction layer we introduce in software building process, and one of these challanges is the management of the Resource files we need to :
- Create, update and communicate with K8s. 
- Express how we want to deploy, scale, control storage 
- Specify how to connect our containers together 
- Monitor their needs and health.

To easily author and maintain these "Resource" files, which are written in YAML, K8s has a package manager, called [Helm](https://helm.sh/). Helm is the defacto package manager for K8s and is widely adopted by the industry. Briefly, what Helm does is to allow users to create templated YAML files and provide a way to render these templates based on a set of values so that they can be reused, these resources are packaged in one coherent self contained package (called a Chart). Helm communicates with the K8s APIs to deploy these resources after rendering the templates with the provided values (a Release) and gives the users the ability to track history of their releases.

For examples of our charts, you can visit this [repository](https://github.com/overture-stack/helm-charts)

## Using Helm

Helm is another abstraction layer and comes with a learning curve, not necessarily a steep one, but still there are a few gotchas 
To use helm as deployment tool for charts we needed to:
- Have the Helm script.
- Create charts and host them:
  -  to host the charts, we have the charts in their own repository and we use [github pages](https://pages.github.com/) as way to host them publicly, it's a quick and easy way to get up and running quickly, see [Overture Charts server](https://github.com/overture-stack/charts-server).
- write the script that will call Helm and pass to it the information it needs to deploy the chart
- Run the deployment script when needed.

In each of these steps we had experiences and lessons that I'll share in this blog.


## Creating Charts
You can get the scaffold for a chart using `helm create <chart name>` After that you need to start customizing the chart files to get what you need.

### Understand the generated chart
- Read the templates.
- Understand the template helpers auto created for you.
- Understand each template and how it will get its values.

### YAML is not Typed
Remember YAML is not typed, but if you pass an string where an integer is expected, like ports for example, on deployment time you will get a cryptic error from K8s about it. Unfortunately the errors are hard to read so keep this in mind when providing values and debugging issues related to types.

### Bundled Charts
Helm allows you to specify dependencies of your chart and it will bundle those together, this approach has Pros and Cons, but usually I'd say we try to avoid it because if the charts diverge during their life time in terms of operations, it can become hard to maintain. So make sure you are aware of the impact of bundling the charts as dependencies, and only do it when needed.

#### Stateful charts 
An example of a case where we bundled charts and learned that it was bad, is when we bundled postgres db with our microservices charts, although it's more convenient to deploy them in one shot, it became harder to maintain.

Stateful applications like DBs have different requirements than stateless applications (microservices):
    - they need storage and storage managment and migrations before deleting a release. 
    - they also store data like passwords in their storage and since it's insecure to keep these values plain in the helm files, we had to resort to `--reuse-values` which also affected our stateless service
    - they don't need frequent updates as microservice, usually stateful sets are 3rd party charts that are stable and rarely touched

So in summary their operations are different from stateless services.

### Passing Application configurations
To pass application configuration, we use Environment variables as recommended by the [12 factor application principles](https://12factor.net/) 
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

My experience is that the 2nd approach is easier to maintain and has less overhead because env vars are added and removed often, and in the second way there is no need to change anything in the chart itself, it is dynamic enough do that through values updates only.

### Chart per service vs Common chart
We started creating a chart per service but after sometime it was clear that for the majority of microservices they all looked the same, regardless of the technology of the service, the charts looked the same. 

So I introduced a generic chart called [Stateless-svc](https://github.com/icgc-argo/charts/tree/master/stateless-svc) and it allows users to configure and customize it through providing the values file. This allows us to:

- enforce common practices like labeling, security, adding extra common resources without having to go over all charts
- maintain only 1 chart for many microservices. There is no need to create a new chart for every new service which cuts the time to get up and running.
- easier to automate and build processes around since there are no special cases.
- consistency in configuring charts and estabilishing conventions.

Some charts are more complicated and may not fit in a generic chart, However, for the majority of services, it will save you a lot of time.


### Secrets Management
At an early stage of the project, ARGO, we had to decide on how to manage secrets, K8s does provide a `Secret`  resource type, however we decided to go with [Vault](https://www.hashicorp.com/products/vault) because it basically provides a richer solution when it comes to secrets management and storage like policies, and different storage backends, etc.

Now that said, reflecting on it, Vault does have challanges to maintain and add new services, so it's worth taking the time to decide to make the jump or just use K8s secrets, because Helm does make it easier to replicate secrets across environments without a lot of manual work, however it's important to do it in an automation friendly manner and avoid using `--reuse-values` (see below why).


### 3rd Party Charts
#### Chart quality 
Not all charts, even official ones, are well written. Creating a new chart can be simple, but creating a production ready and high quality chart requires more effort and maintenance, take the time to research and consider the following when you select a chart:
- It allows Secure configurations (running containers without root) and some are even secure by default.
- It allows adding extra secrets, extra Environment values, labels, etc, all these will make customization much easier.
- Maintianability, look for charts that are well maintained and widely used.
- Reliabile, some stateful charts use volumes instead of properly using Stateful sets, which can result in data loss if the helm release gets deleted.

Example on this is using postgres chart from the helm stable repository vs Bitnami chart, the Bitnami chart has higher quality and is a better fit for produciton environments and they allow secure configurations out of the box.

#### Operator Charts
Operator pattern is very powerful and much more suitable for production operations than satetful set charts, it's much easier to manage application and it abstracts many of the network details in a good way, check Prometheus opreator chart for example.

### Chart version vs App version
Another challange we face is now we have another version to maintain, which is the chart version, in our release process we have to record the chart version that needs to be released if changes occured to the chart, which is not hard but is an extra thing to worry about. This is why keeping charts as generic as possible is a good thing to avoid the need to update it very often for small app related changes.


## Deploying Charts
### Helm values 
When you deploy a chart you usually need to override the default values to fit your needs and there are two ways to do it either inline or using values files.
to keep things organized and keep thing well tracked in source control we have a git repository with all the values files for each environment and that way when we run helm commands we can direct it to the right values files per chart.  
example: `helm upgrade ego -f values/qa/values.yaml overture/ego` 

### Reuse values flag `--reuse-values`
Helm provides a flag to reuse the same values from the exsiting release, it does a three way merge between default values in the chart, values you provide in the command line, values you provide from files using `-f` and existing values from the existing release, if any. 

This from our experience turned out to be problematic, because it's not clear for anyone who looks at our values repostiory (the section above) to know for sure what the final values will be, if `--reuse-values` is used. 

It's better when everything is explicit in the values file to avoid these problems and avoid unexpected values ending in the release. That said, in some cases as I mentioned, secrets can be a challange unless you provide them everytime you do the release, so reuse values can be helpful there. 

Consider limiting your use of `reuse-values` unless necessary and isolate the charts that need such treatement or avoid them all together by using charts 
that don't need to provide secrets everytime.

## Automating Deployments
### Jenkins Pipelines
In our JenkinsFile in each service we have a job call to the deploylment job that deploys the service to a specific K8s namespace, the deployment job is basically a parameterized script that eventually runs a `helm upgrade` command, [example:](https://github.com/overture-stack/ego/blob/develop/Jenkinsfile) 

```
        stage('Deploy to Overture QA') {
            when {
                  branch "develop"
            }
			steps {
				build(job: "/Overture.bio/provision/helm", parameters: [
						[$class: 'StringParameterValue', name: 'OVERTURE_ENV', value: 'qa' ],
						[$class: 'StringParameterValue', name: 'OVERTURE_CHART_NAME', value: 'ego'],
						[$class: 'StringParameterValue', name: 'OVERTURE_RELEASE_NAME', value: 'ego'],
						[$class: 'StringParameterValue', name: 'OVERTURE_HELM_CHART_VERSION', value: '2.5.0'],
						[$class: 'StringParameterValue', name: 'OVERTURE_HELM_REPO_URL', value: "https://overture-stack.github.io/charts-server/"],
						[$class: 'StringParameterValue', name: 'OVERTURE_HELM_REUSE_VALUES', value: "false" ],
						[$class: 'StringParameterValue', name: 'OVERTURE_ARGS_LINE', value: "--set-string image.tag=${commit}" ]
				])
			}
        }
````
and this job pulls down the git repository where the helm values files are and executs the helm command:

```
def releaseName = env.OVERTURE_RELEASE_NAME
def deployTo = env.OVERTURE_ENV
def chartName = env.OVERTURE_CHART_NAME
def helmRepoUrl = env.OVERTURE_HELM_REPO_URL
def helmRepoName = 'the_repo'
def chartVersion = env.OVERTURE_HELM_CHART_VERSION
def dryRun = env.OVERTURE_HELM_DRY_RUN == 'true' ? '--dry-run' : ''
def reuseValues = env.OVERTURE_HELM_REUSE_VALUES == 'true' ? '--reuse-values': ''
def versionArg = chartVersion == null || chartVersion == '' ? '' : "--version $chartVersion"
def argsLine = env.OVERTURE_ARGS_LINE == null ? '' : env.OVERTURE_ARGS_LINE

def nameSpace = ""
switch ( deployTo ) {
  case "staging":
    nameSpace = "overture-$deployTo"
    break
  case "qa":
    nameSpace = "overture-$deployTo"
    break
  default:
    nameSpace = "-"
}

def command = """helm upgrade $releaseName \\
  --install \\
  --namespace=$nameSpace \\
  $helmRepoName/$chartName \\
  $versionArg \\
  -f helm/$releaseName/$deployTo/values.yml ${dryRun} ${reuseValues} ${argsLine}
"""

pipeline {
    agent {
        kubernetes {
            label 'provision-executor'
            yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: helm
    image: alpine/helm:3.0.2
    command:
    - cat
    tty: true
"""
        }
    }
        
    stages {
      stage('Deploy') {
        steps {
          container('helm') {
            sh 'env'
            sh "helm ls --namespace=$nameSpace"
            sh "helm repo add $helmRepoName $helmRepoUrl"
            sh """$command"""
          }
        }
      }
    }
}

```

### Terraform 
Our charts repositories (i.e. the url of where the chart is hosted), specially 3rd party chart are not recorded anywhere in helm values files, same for the chart version. We are now relying on jenkins parameters to provide and feed these to the scripts. Also trying to know everything we use in our stack deployment requires looking around the git repository and cannot be seen in a simple fashion as, for example, a docker compose file.

My colleague, Dusan, worked on enahncing and automating helm releases with Terraform to address these gaps, but that will be a topic for another blog.


Thanks for reading ! Happy Helming

