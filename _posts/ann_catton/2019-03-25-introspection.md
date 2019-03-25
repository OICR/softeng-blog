---
layout: post
title: "Tell Me About Yourself, GraphQL"
breadcrumb: true
author: ann_catton
date: 2019-03-25
categories: ann_catton
tags:
  - graphql
  - elasticsearch
  - introspection
teaser:
  info: Using GraphQL introspective queries to explore your schema
  <!-- image: ann_catton/introspection/something.png -->
  <!-- image_size_strategy: cover -->
header:
  version: small
  title: Software Engineering Blog
  image: header-logo-crop.png
  icon: icon-blog
---

We will be introducing a few new features to the [GDC Data Portal](https://portal.gdc.cancer.gov/){:target="\_blank"} in the coming months, centering around our clinical data. Currently, we provide a list of clinical fields users can query in our Explore feature. For our development team, these fields come from a static source that has been difficult to keep up-to-date with what is in our Elasticsearch index, and implementing the new features seemed like a good opportunity to improve on this. What we needed was simple: a list of relevant clinical fields from our index, their data type, and a brief description of each for users to reference in the Portal. As it turns out, GraphQL has a clever tool for just such a requirement: [Introspection](https://github.com/facebook/graphql/blob/master/spec/Section%204%20--%20Introspection.md#introspection){:target="\_blank"}.

I didn’t know about introspection queries, although I’d unknowingly been using them with the Docs feature of [GraphiQL](https://electronjs.org/apps/graphiql){:target="\_blank"}, a fantastic tool for working with GraphQL servers that was especially helpful here.

<figure>
  <img src="{{site.urlimg}}ann_catton/introspection/graphiql_doc_explorer.png" />
  <figcaption>GraphiQL's Doc Explorer</figcaption>
</figure>

Introspective queries are super-straightforward - the kind of thing that, once you know about it, seems so very obvious. Instead of querying data from your index, you are querying the schema itself. This is a great way to explore a schema you are unfamiliar with or, in our case, get documentation on your schema.

To get started, we used the meta-field `__schema` ([reserved](https://github.com/facebook/graphql/blob/master/spec/Section%204%20--%20Introspection.md#reserved-names){:target="\_blank"} names in the introspection system are prefixed with `__`), which returns a list of all the types in your schema. This gives you a good overview of which types you can query:

```javascript
{
  __schema {
    types {
      name
    }
  }
}
```

And the (abbreviated) response:

```javascript
{
  "data": {
    "__schema": {
      "types": [
        {
          "name": "Root"
        },
        {
          "name": "ID"
        },
        {
          "name": "Node"
        },
        {
          "name": "User"
        },
        {
          "name": "String"
        },
        {
          "name": "QueryResults"
        },
        {
          "name": "RepositoryCases"
        },
        ...
      }
    }
```

Once you have a list of types, you can then use the meta-field `__type` to get more information about a specific type by using a Type Name introspection query:

```javascript
{
  __type(name: String!) {
    name
    fields {
      name
      description
    }
  }
}
```

Depending on your schema, you may need to add more levels of nesting to your query. The information we were trying to get at is another level down, so we had to repeat ourselves a little. We first tried querying type `"Case"`, as all clinical fields are nested under this type in our [case centric index](https://github.com/NCI-GDC/gdc-models/blob/master/es-models/case_centric/case_centric.mapping.yaml){:target="\_blank"}:

```javascript
{
  __type(name: "Case") {
    fields {
      name
      description
      type {
        name
        fields {
          name
          description
          type {
            name
          }
        }
      }
    }
  }
}
```

However, the result didn’t go very far down the tree; what was under `"Case"` was mostly metadata fields, and we didn’t find a lot of the fields we were looking for from the models. We dug around some more, trying instead more specific types from our clinical data, such as `"Treatment"` and `"Diagnosis"`. I thought we'd hit the jackpot with this one; it returned a lot of data that _looked_ like what we needed - a good list of fields with their descriptions and types, without a lot of metadata fields we didn’t need. But comparing the results to our models, we soon discovered this was coming from our [data dictionary](https://github.com/NCI-GDC/gdcdictionary/tree/develop/gdcdictionary/schemas){:target="\_blank"}, and had more fields than what was in the index. We’d end up with a different version of the same issue. We needed to query a type that had its source in our case index.

Admittedly the process was a little trial-and-error (made a lot easier with GraphiQL), but eventually we arrived at `"ExploreCases"`. This query gave us a list of all the fields we were expecting from our case_centric model, with their associated descriptions and types.

An example field from the response:

```javascript
{
  "__type": {
    "fields": [
      {
        "description": null,
        "name": "aggregations",
        "type": {
          "fields": [
            {
              "description": "Category describing current smoking status and smoking history as self-reported by a patient.\n",
              "name": "exposures__tobacco_smoking_status",
              "type": {
                "name": "Aggregations"
              }
            }
          ]
        }
      }
    ]
  }
}
```

This was all the field data we needed for our new ui features. As a bonus, we now have a better idea of where some of our data is coming from - it was certainly surprising to find it was not all coming from our Elasticsearch models, as I had expected. And best of all, we have a strategy to integrate new clinical types that haven’t yet been indexed. By querying the schema itself, we’ll be able to pick them up as they are added.

The introspection system provides many more tools to interact with GraphQL servers; we are using just one facet. We will certainly be taking advantage of this particular feature wherever else we can use this type of documentation on the Portal. It is a simple and elegant solution that will keep us up-to-date with the index, and remove the need to maintain a secondary resource. And, it’s a brilliant tool for exploring any GraphQL schema with which you may find yourself working.

[H/T to Alex Lepsa for the introspection intro!]

### More info

[From GraphQL](https://graphql.org/learn/introspection/){:target="\_blank"} <br />
[On Github](https://github.com/facebook/graphql/blob/master/spec/Section%204%20--%20Introspection.md){:target="\_blank"}
