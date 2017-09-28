---
layout: post
title:  "Proof of Concept: Implement Directed Acyclic Graph DB with Version Control using Elasticsearch"
breadcrumb: true
author: junjun_zhang
date: 2017-09-28
categories: junjun_zhang
tags:
    - Graph database
    - DAG
    - Version control
    - Elasticsearch
teaser:
    info: A step-by-step illustration on how Elasticsearch could be used to implement a version controlled directed acyclic graph database.
    image: junjun_zhang/DagVC.png
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---
[Git](https://git-scm.com/) and [Elasticsearch](https://www.elastic.co/products/elasticsearch) are
my two favorite technologies. In a technical sense, they don't share anything in common but both
are elegantly designed, and vastly useful in the area of my work. See my previous
[post](/linda_xiang/2016/12/12/Cloud-data-transfer) (co-authored with Linda) for an example how
we used Git server as a job scheduling orchestrator.

In this post I will walk you through, step by step, a proof of concept design on how Elasticsearch could be used to implement a
directed acyclic graph (DAG) database with version control capability. With no surprise, the version
control part was inspired by [how Git works internally](https://git-scm.com/book/en/v1/Git-Internals-Git-References).

OK, let's get started.

## What is a version controlled DAG DB anyway?

As depicted in Figure 1, the graph schema defines that the DAG consists of four types of entities
with derivative relationship as such: D derives from B and/or C, C derives from B, B derives from A.

<figure>
    <img src="{{site.urlimg}}junjun_zhang/DagVC.png" />
    <figcaption>Figure 1: DAG with Version Control</figcaption>
</figure>

The graph as a whole is denoted as `DAG` appended with a revision number, eg, `DAG.1`. Nodes are
labelled using its ID appended with a revision number. For example, `a1.1` denotes entity `a1`
at revision 1. Relationships are represented as arrows pointing from child node to parent node.

At a very minimum, we would expect a DAG database to record every node and its relationships
to other nodes and allow changes (update, create and delete) to be made to the nodes and
relationships in conformity with the defined schema. For querying, a DAG DB should be able to
lookup for any node by its ID and traverse the graph to retrieve related nodes.

A version controlled DAG DB will add additional capabilities to keep full history of changes made to
the DAG, allowing access to any snapshot of the entire DAG and any revision of individual node.
In a sense, much like what you can do in Git.

In Figure 1, changes in version 2 of the `DAG` include:
- updated `b1.1` to `b1.2`
- updated `c1.1` to `c1.2`
- created `c3.1`
- deleted `c2.1`
- created `d2.1`

After all the changes have been applied to the database, a version controlled DAG DB would allow
us travel back in time, access the DAG as if there were no change made at all. It's also possible to
retrieve all historic revisions of a particular node, and find out what exact change had made
to it at each revision.

If all that sounds like magic to you, or you may think it's going to be too hard to implement
such a system. Please follow along, let's make the magic happen together.

## Model DAG using JSON documents

It's fairly straightforward to represent node as a JSON document, edge 
as JSON field containing ID(s) of parent node(s). Two examples given below
illustrate how `a1` and `d1` may be represented as JSON documents.

{% highlight javascript %}
a1 = {
         "type": "A",     // entity type
         "id": "a1",      // identifier of the node
         "p_id": [],      // list of identifier of direct parent(s)
         "data": {}       // any arbitrary JSON object
     }
d1 = {
         "type": "D",
         "id": "d1",
         "p_id": ["b1", "c1"],
         "data": {}
     }
{% endhighlight %}

## Add revision in JSON documents

In order to track individual revision of a particular node, we add its revision number to
the identifier, for example, `a1.1` and `a1.2` represent `a1` at revision `1` and `2` respectively.
This new identifier becomes globally unique that can be used to unambiguously identify a unique JSON
document in the database. 

Here is how the JSON document for `d1.1` looks like when revision information is incorporated.

{% highlight javascript %}
d1.1 = {
         "type": "D",
         "id": "d1",                  // unique ID in a given revision of the DAG
         "_id": "d1.1",               // true unique ID for the node
         "p_id": ["b1", "c1"],
         "a_id": ["a1", "b1", "c1"],  // add all ancestor IDs to facilitate query
         "data": {}
       }
{% endhighlight %}

## Add revision to the DAG as a whole

For any given revision of the DAG, we need to know which particular JSON documents (each representing a node) were
part of the DAG. This can be achieved by creating a list of unique IDs of every member node of the graph.
For example, `DAG.2` contains `a1.1`, `b1.2`, `b2.1`, `c1.2`, `c3.1` `d1.1` and `d2.1`. As
nodes are defined in different types, we may alternatively keep revisions for each node type,
and then combine all node types to the DAG level. This tiered approach is advantageous as
it helps reduce the size of the list and tracks revision at node type level as well. Below is
what it looks like. For example, `B.2` denotes revision 2 of node type B and its participating
member nodes include `b1.2` and `b2.1`.

{% highlight javascript %}
A.1 = ["a1.1"]
B.1 = ["b1.1", "b2.1"]
B.2 = ["b1.2", "b2.1"]
C.1 = ["c1.1", "c2.1"]
C.2 = ["c1.2", "c3.1"]
D.1 = ["d1.1"]
D.2 = ["d1.1", "d2.1"]
DAG.1 = ["A.1", "B.1", "C.1", "D.1"]
DAG.2 = ["A.1", "B.2", "C.2", "D.2"]
{% endhighlight %}

Up to this point, it should be clear how all revisions of the DAG are accessible at any given
time. To access `DAG.1` we simply look up JSON documents included in `A.1`, `B.1`, `C.1` and
`D.1`, which works out to be `a1.1`, `b1.1`, `b2.1`,`c1.1`, `c2.1` and `d1.1`.

All three types of possible change to the DAG are handled as follows:
- create new node: create a JSON doc with new ID and assign revision 1
- update existing node: create a JSON doc with the same ID as existing one and increment revision by 1
- delete existing node: simply exclude it in the graph member list

As you may have noticed all JSON documents in the DAG are completely immutable, they will never
be deleted or changed once written. This is essentially how Git version control system works under
the hood. The node JSON docs are like Git blob objects; the graph member lists for each node type
are similar to Git tree objects.


## Implement it in Elasticsearch

Now we are ready to put everything into Elasticsearch, you should be able to simply copy and paste
the curl commands to run on your computer if you have Elasticsearch installed and accessible at
`http://localhost:9200`.

### Create version 1 of the DAG

We will have two different kinds of Elasticsearch indexes, one for
data, the other to keep list of graph member nodes' ID for each revision.

First create JSON docs for each node in `DAG.1`. Here shows example curl commands to create `a1.1` and `b1.1`:
{% highlight bash %}
# create a1.1, note that we do not need to have _id (a1.1) in the JSON document, the _id is specified in the HTTP request URL as document ID
# we use '.d.' as namespace prefix to separate out from other indexes unrelated to our work
curl -XPUT 'localhost:9200/.d.dag.data.a/A/a1.1' -d'
{
  "type": "A",
  "id": "a1",
  "p_id": [ ],
  "a_id": [ ],
  "data": { }
}
'
curl -XPUT 'localhost:9200/.d.dag.data.b/B/b1.1' -d'
{
  "type": "B",
  "id": "b1",
  "p_id": [ "a1" ],
  "a_id": [ "a1" ],
  "data": { }
}
'
{% endhighlight %}

The full list of the curl commands to create all nodes is [here](https://gist.githubusercontent.com/junjun-zhang/8362c66d20f48073c644bd02062922c0/raw/c87fc94d2aac87e87e1bc2f0ceda0f4355b73e9f/1_create_nodes_for_dag_1.sh).

Now, let's create JSON docs for graph member lists. Here is an example for `A.1`:
{% highlight bash %}
curl -XPUT 'localhost:9200/.d.dag.rev.a/A/A.1' -d'
{ "m_ids": ["a1.1"] }
'
{% endhighlight %}

Again, the full list of commands is [here](https://gist.githubusercontent.com/junjun-zhang/8362c66d20f48073c644bd02062922c0/raw/c87fc94d2aac87e87e1bc2f0ceda0f4355b73e9f/2_create_graph_member_lists_for_dag_1.sh).

Finally, we need to link `DAG.1` to the collection of versioned node types: `["A.1", "B.1", "C.1", "D.1"]`.
An elegant way to do this in Elasticsearch is to create an index alias with terms lookup
filter to provide a virtual view to the underlying JSON docs with desired filtering. This
is the core of the whole design.

{% highlight bash %}
curl -XPOST 'localhost:9200/_aliases' -d '
{
  "actions": [
    {
      "add": {
        "index": ".d.dag.data.*",
        "alias": ".d.dag.1",
        "filter": {
          "bool": { "minimum_should_match": 1,
            "should": [ 
              { "terms": { "_id": { "index": ".d.dag.rev.a", "type": "A", "id": "A.1", "path": "m_ids" } } },
              { "terms": { "_id": { "index": ".d.dag.rev.b", "type": "B", "id": "B.1", "path": "m_ids" } } },
              { "terms": { "_id": { "index": ".d.dag.rev.c", "type": "C", "id": "C.1", "path": "m_ids" } } },
              { "terms": { "_id": { "index": ".d.dag.rev.d", "type": "D", "id": "D.1", "path": "m_ids" } } }
            ]
          }
        }
      }
    }
  ]
}
'
{% endhighlight %}

Version 1 of the DAG can always be accessible via the alias: `.d.dag.1`.

### Create version 2 of the DAG

Let's make changes to the DAG to make it version 2.

Update `b1` from `b1.1` to `b1.2`, just need to create `b1.2`. We leave `b1.1` unchanged.
{% highlight bash %}
curl -XPUT 'localhost:9200/.d.dag.data.b/B/b1.2' -d'
{
  "type": "B",
  "id": "b1",
  "p_id": [ "a1" ],
  "a_id": [ "a1" ],
  "data": { "something": "changed in revsion 2 of b1 node" }
}
'
{% endhighlight %}

To reflect the change of `b1.1` to `b1.2`, we need to update graph member list to drop `b1.1` and add `b1.2` for revision
2 of node type B, ie, `B.2`.

{% highlight bash %}
curl -XPUT 'localhost:9200/.d.dag.rev.b/B/B.2' -d'
{ "m_ids": ["b1.2", "b2.1"] }
'
{% endhighlight %}

In a similar way we can perform other changes. Full list of the commands is [here](https://gist.githubusercontent.com/junjun-zhang/8362c66d20f48073c644bd02062922c0/raw/c87fc94d2aac87e87e1bc2f0ceda0f4355b73e9f/4_update_the_graph_to_version_2.sh).
Please download and run them on your computer.

The last step is to create another index alias: `.d.dag.2`:
{% highlight bash %}
curl -XPOST 'localhost:9200/_aliases' -d '
{
  "actions": [
    {
      "add": {
        "index": ".d.dag.data.*",
        "alias": ".d.dag.2",
        "filter": {
          "bool": { "minimum_should_match": 1,
            "should": [ 
              { "terms": { "_id": { "index": ".d.dag.rev.a", "type": "A", "id": "A.1", "path": "m_ids" } } },
              { "terms": { "_id": { "index": ".d.dag.rev.b", "type": "B", "id": "B.2", "path": "m_ids" } } },
              { "terms": { "_id": { "index": ".d.dag.rev.c", "type": "C", "id": "C.2", "path": "m_ids" } } },
              { "terms": { "_id": { "index": ".d.dag.rev.d", "type": "D", "id": "D.2", "path": "m_ids" } } }
            ]
          }
        }
      }
    }
  ]
}
'
{% endhighlight %}

We can also create aliases for `.d.dag.latest` to access latest version of the DAG and `.d.dag.all` to
access all nodes including historic revisions. [Here](https://gist.githubusercontent.com/junjun-zhang/8362c66d20f48073c644bd02062922c0/raw/c87fc94d2aac87e87e1bc2f0ceda0f4355b73e9f/5_create_alias_for_dag_2_and_more.sh) are the curl commands.

## Cool things you can do with version controlled DAG DB

As all nodes are indexed in Elasticsearch, you get all powerful search and aggregation for
free. Some graph specific queries should be very performant since there is no traversal needed.
Below are just some quick examples.

- get `b1` from the latest revision of the DAG

{% highlight bash %}
curl -XGET 'localhost:9200/.d.dag.latest/_search' -d '
{ "query": { "term": { "id": { "value": "b1" } } } }
'
{% endhighlight %}

- get `b1` from the revision 1 of the DAG
{% highlight bash %}
curl -XGET 'localhost:9200/.d.dag.1/_search' -d '
{ "query": { "term": { "id": { "value": "b1" } } } }
'
{% endhighlight %}

- get all revisions of `b1` from the DAG (query across all revisions)
{% highlight bash %}
curl -XGET 'localhost:9200/.d.dag.all/_search' -d '
{ "query": { "term": { "id": { "value": "b1" } } } }
'
{% endhighlight %}

- get all descendant nodes for `b1` from the latest revision of the DAG
{% highlight bash %}
curl -XGET 'localhost:9200/.d.dag.latest/_search' -d '
{ "query": { "term": { "a_id": { "value": "b1" } } } }
'
{% endhighlight %}

- get all ancestor nodes for d2 in `DAG.2`
{% highlight bash %}
# first, get d2 in DAG.2
curl -XGET 'localhost:9200/.d.dag.2/_search' -d '
{ "query": { "term": { "id": { "value": "d2" } } } }
'
# we get "a_id": [ "a1", "b1", "b2", "c3" ], now we lookup nodes with these IDs 
curl -XGET 'localhost:9200/.d.dag.2/_search' -d '
{ "query": { "terms": { "id": ["a1", "b1", "b2", "c3"] } } }
'
{% endhighlight %}

## Further thoughts

Benefited from the data immutability nature in the design, it's reasonable to expect high reliability
and ease of use for both end users and administrators. Any entity or a group of entities (via creation
of arbitrary entity collection) can be exposed as resources with permanent URI.

One thing needs to keep in mind is that although Elasticsearch is highly scalable, the DAG DB may not be able
to scale for very large graph, this is because the number of elements (node IDs) for terms lookup filter
is not supposed to be very large, tens of thousands per node type may be the upper limit. This is not necessarily a
show-stopper, proper modeling of the graph schema to partition the data and avoid single large node type
can effectively address this potential limitation.

Although most [resiliency issues](https://www.elastic.co/guide/en/elasticsearch/resiliency/current/index.html)
have been addressed in Elassticsearch, it is still not officially recommended to use it as
the primary datastore. However, as the proposed DAG DB is append only, frequent Elasticsearch incremental backup should
be quick to perform and will help minimizing the risk of data loss.

Some prototype work should be helpful in order to understand better the characteristics of this proposed
version controlled DAG DB design. To find out how it turns out, stay tuned for my next blog post on this.
Until then!

