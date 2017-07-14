---
layout: post
title:  "A Detailed Example of Writing CSV Files using Different CSV Processing Libraries"
breadcrumb: true
author: robert_tisma
date: 2017-07-10
categories: robert_tisma
tags:
    - Java 8
    - Decorator Pattern
    - Bridge Pattern
    - Lambda Functions
    - Method References
    - OpenCSV
    - SuperCSV
    - jackson-dataformat-csv
    - CSV
teaser:
    info:  A Detailed Example of Writing CSV Files using Different CSV Processing Libraries
header: 
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---

## Table of Contents
1. [Introduction](#introduction)
2. [Objective](#objective)
3. [Background](#background)
    1. [What is the CSV format and RFC-4180](#what-is-the-csv-format-and-rfc-4180)
    2. [How does CSV writing work](#how-does-csv-writing-work)
    3. [CSV Schemas](#csv-schemas)
4. [Example: Writing Person data to csv](#example-writing-person-data-to-csv)
    1. [Overview](#overview)
    2. [Design](#design)
        1. [Context Configuration](#context-configuration)
        2. [CsvWriterBridge Construction](#csvwriterbridge-construction)
        3. [Execution](#execution)
    3. [Testing](#testing)
        1. [COMMA_SEP_NO_QUOTES_REGULAR_ORDER](#comma_sep_no_quotes_regular_order)
        2. [TAB_SEP_WITH_QUOTES_REGULAR_ORDER](#tab_sep_with_quotes_regular_order) 
        3. [COMMA_SEP_NO_QUOTES_ORDER_SHIFTED_BY_2](#comma_sep_no_quotes_order_shifted_by_2)
        4. [COMMA_SEP_NO_QUOTES_1_LESS_HEADER](#comma_sep_no_quotes_1_less_header)
5. [Conclusion](#conclusion)
        
## Introduction

A few months ago, I worked on a project that involved writing model objects to CSV files in a particular order with specific header names. Since classes defining the models were located in an external library, the field names could not be renamed to match the required headers. I then set out on a mission to analyze how I could approach this problem using different libraries, such as SuperCSV, OpenCSV, Jackson and even my very own simple implementation. In this blog post, I will be defining the problem, describing the design used to solve the problem, and analyzing the results of different implementations. 

## Objective

The objective is to write a collection of [beans](https://en.wikipedia.org/wiki/Plain_old_Java_object#JavaBeans) 
or [POJOs](https://en.wikipedia.org/wiki/Plain_old_Java_object) (Plain Old Java Object - which is a mutable Java class that contains an empty, argument-less constructor, with a getter and setter method for each field) to CSV files using several external libraries, while adhering to the following constraints:

- __Rule 1:__ _Ordered Headers_ - the number of headers and their order may vary from how they are defined in the model.
- __Rule 2:__ _Alternative Header Names_ - the column names could be different from the names of the corresponding member variable in the model class.
- __Rule 3:__ _Model Code Freeze_ - the library containing the model class has its source code frozen, so changes to the code are not possible for the current release.
- __Rule 4:__ _Encapsulated Configurational Changes_ - ensure that when a configuration needs to be changed, it only needs to be changed in one definition (enumeration, method, constant or fixture) and not in many definitions. This minimizes potential human error, where one definition was updated, but the other was not.

The source code for this blog post (available [here](https://github.com/rtisma/blogpost-writing-csv-files)) and must be designed in a way that allows easy "plug and play" of different CSV processing libraries, that generalizes configuration, creation and execution of the CSV writers. The libraries that will be used are OpenCSV, SuperCSV, jackson-dataformat-csv and a simple custom solution. In addition to using the bean-based introspective schema strategies, each library should also use the following non-bean based custom schema strategies:

1. __Explicit Schema Strategy__: converting a bean to a `String[]` by hardcoding method calls
2. __Lambda Schema Strategy__: converting a bean to a `String[]` by calling Java 8 method references that point to the getter methods of the bean.

Ultimately, the software must be maintainable and human readable. The goal is to write loosely coupled and highly cohesive software, that not only adheres to the [SOLID](https://en.wikipedia.org/wiki/SOLID_(object-oriented_design)) design principles but is also self-documenting.

## Background

### What is the CSV format and RFC-4180?

The term CSV stands for "Comma Separated Value", and represents a loosely defined format for representing tabular data using plain text, where commas separate field values (columns) and newlines separate records (rows). 
The plain text representation of tabular data is not limited to the CSV format, the TSV (Tab Separated Value) format provides an alternative, using the tab character instead of the comma character.
CSV is commonly used as a data exchange format for scientific and business applications and is popular for its simplicity and for being human readable.

Although the CSV format is relatively straight forward, it lacks official standardization. When writing or parsing CSV files, there are several edge cases that need to be standardized so that libraries can all conform to the same rules of CSV processing. The [RFC-4180](https://www.rfc-editor.org/rfc/rfc4180.txt) specification attempts to standardize the format, and is commonly used in many CSV processing libraries, such as 
[jackson-dataformat-csv](https://github.com/FasterXML/jackson-dataformats-text/tree/master/csv), 
[OpenCSV](http://opencsv.sourceforge.net/), 
 and [SuperCSV](http://supercsv.sourceforge.net/). When parsing CSV files, there are several corner cases that require special handling, such as escaped quotes for a quoted CSV file, fields that can contain new lines, fields that contain the delimiting character, and so on. Although this is beyond the scope of this blogpost, the [details involved in csv parsing](https://www.codeproject.com/Articles/1175263/Why-to-build-your-own-CSV-parser-or-maybe-not)
 can be described using a [Mealy finite state machine](https://en.wikipedia.org/wiki/Mealy_machine):

<figure>
    <img src="https://www.codeproject.com/KB/string/1175263/csv.diagram.png" />
    <figcaption>CSV Parsing Finite State Machine</figcaption>
</figure>


### How does CSV writing work?
All CSV processors contain two fundamental features, however this blogpost will focus only on the latter:

1. __CSV Parsing__ - converting contents (header and records) of a CSV file into beans the programming language can use
    
2. __CSV Writing__ - writing the data contents of a collection of beans to a CSV file 
 
Writing a collection of beans to a CSV file can be modelled using these steps: 

1. Write the header at the beginning (this is optional)
2. For each bean, do the following:
    1. Convert the bean to a `String[]` (string array), using a CSV schema
    2. Write the `String[]` to file, abiding by RFC-4180 if available
    
The second step can be illustrated as follows:

<figure style="width:700px;">
    <img src="{{site.urlimg}}robert_tisma/writing_csv_files/csv_conv_diagram.svg" />
    <figcaption>Figure 1: CSV Writing Process </figcaption>
</figure>

Since many CSV processing libraries share the same features (obviously with different performance characteristics), what else differentiates them? One important feature is mapping a bean field to a CSV column, which can alternatively be described as configuring a schema.
All libraries essentially write a `String[]` to a line in a CSV file under the hood, however the magic lies in configuring the CSV writer using a schema. 

### CSV Schemas

CSV schemas effectively map getters and setters corresponding to a bean field, to a column name in a CSV file. Referring to __Figure 1__, the schema is used in the object conversion step where a bean is converted to a `String[]`. In libraries such as OpenCSV, SuperCSV, and jackson-dataformat-csv, schemas are created by bean introspection which uses the java reflection api. For instance, the OpenCSV library relies on [annotation processing](https://www.javacodegeeks.com/2015/09/java-annotation-processors.html), where bean fields are annotated with specific annotations and are processed to create a schema. All CSV processing libraries that support beans 
have their own strategy for creating schemas, which is what primarily differentiates them.

## Example: Writing Person data to csv

In the following example, I will be explaining how to configure, construct and write a collection of beans to a CSV file, while abiding by the rules outlined in the [Objective](#objective) section, and discussing some of the issues 
for each configuration. The source code is freely available on [github](https://github.com/rtisma/blogpost-writing-csv-files)

### Overview

The model that will be used for this example will be the `PersonBean` bean

```java
public class PersonBean implements Person {

  private Integer id;
  private String firstName;
  private String lastName;
  private Integer age;
  
  public PersonData(){}
  
  //Getters, Setters, Equals, hashcode, toString
}
```
which implements the `Person` interface. This code lives in the `blog1-model` module, and will represent frozen code which is unmodifiable, meaning you cannot add annotations, change member field names or their order. Each row of CSV data represents the same data as this bean. In this example, a fixed and pre-populated list of `PersonBean` object was used to test the different `CsvWriterBridge` implementations, by writing the list to a CSV file. Using the 3 external CSV processing libraries, several configurations can be achieved, as discussed in the testing section. There are 2 categories of configurations: bean based (any configuration suffixed with `*_BEAN`) and non-bean based (any configuration suffixed with `*_EXPLICIT` and `*_LAMBDA`). All `*_BEAN` configurations use the underlying library's bean introspective functionality, while all `*_EXPLICIT` configurations use the _Explicit Schema Strategy_ (defined in the [Objective](#objective) section) in combination with the library's `String[]` CSV Writer. Likewise, the _Lambda Schema Strategy_ is used for all `*_LAMBDA` configurations, and is intended to highlight its superiority over the _Explicit Schema Strategy_. An overview of the stages involved are shown in __Figure 2__ 

<center>
<figure style="width:270px;">
    <img src="{{site.urlimg}}robert_tisma/writing_csv_files/process_overview.svg" />
    <figcaption>Figure 2: Stages for writing CSV files </figcaption>
</figure>
</center>

In addition, the source code requires Java 8 to compile, uses [Apache Maven](https://maven.apache.org/) as the build automation tool, and [Junit](http://junit.org/junit4/) as the testing framework.


### Design
The following describes the details behind each processing stage in the previous diagram. Although the source code is fairly straight forward and self documenting, the descriptions give insight into some of the design decisions that were used.

#### Context Configuration
In order to properly configure the CSV writers, certain prerequisite data is needed. After analyzing configurations of each CSV processing library, a common context data type, called `CsvWriterBridgeContext`, was designed to encapsulate the common configurational data, which satisfies __Rule 4__. All CSV writers need a core `Writer` instance, along with information regarding separation characters and quote characters.

This step creates the context needed to commonly configure all 4 CSV writer implementations, as illustrated in __Figure 3__

<center>
<figure style="width:325px;">
    <img src="{{site.urlimg}}robert_tisma/writing_csv_files/context_configuration.svg" />
    <figcaption>Figure 3: Steps involved in the Context Configuration stage  </figcaption>
</figure>
</center>

Firstly, the schema is created. In the non-bean based configurations (i.e `*_LAMBDA` and `*_EXPLICIT`), the schema is defined as an array of `SchemaField<T>`, where `T` represents the bean class:

```java
public interface SchemaField<T> {

  // The name of the bean member variable
  String getFieldName(); 
  
  // The name of the CSV column name
  String getAlternativeFieldName(); 
  
  // Method reference to the Getter method corresponding to the bean's member variable
  Function<T, Object> getGetter(); 
  
}
```
For the `Person` data type (recall, `PersonBean` **_is-a_** `Person`), the schema definition is defined in an enumeration called `PersonSchema`, where each value is of type `SchemaField<Person>`. By analyzing the above code, it should be clear that each `SchemaField` effectively links the bean field name, CSV column name, and the operation to retrieve the corresponding value from the bean. Therefore, an ordered collection of `SchemaField<T>` objects fulfills the fundamental purpose of a CSV schema, and Rules 1,2,3, and 4.

Lastly, the schema is used to create the `CsvWriterBridgeContext`, which is used in the next stage to build the a CSV writer.

#### CsvWriterBridge Construction 

The purpose of this stage is to create a CSV writer using a selected implementation and the previously constructed `CsvWriterBridgeContext`. __Figure 4__ below outlines the steps required in this stage:

<center>
<figure style="width:700px;">
    <img src="{{site.urlimg}}robert_tisma/writing_csv_files/csv_writer_bridge_construction.svg" />
    <figcaption>Figure 4: Steps involved in CsvWriterBridge Construction stage  </figcaption>
</figure>
</center>

At the core of this design, is the `CsvWriterBridge` interface, which exposes essential CSV writing functionality that is available in all CSV writer libraries. As described in the [How does CSV writing work?](#how-does-csv-writing-work) section, the requirements are to write the header, and one or more beans to a csv file. The `CsvWriterBridge` interface defines this functionality in the code below:

```java
public interface CsvWriterBridge<T> extends Closeable {

  void writeHeader() throws  IOException;
  void write(T object) throws IOException;
  
  default void write(List<? extends T> objects) throws IOException {
    for (T object :objects){
      this.write(object);
    }
  }
}
```

Using this interface, the [bridge design pattern](https://simpleprogrammer.com/2015/06/08/design-patterns-simplified-the-bridge-pattern/) can be used to decouple a CSV writer from its 
implementation. By implementing `CsvWriterBridge` for each library, execution of different configurations can 
be achieved by simply programming to the interface, and replacing one implementation for the other. Although the 
concept is simple, it is very effective, as it helps write modular and human readable code.


##### Bean and Non-Bean Based Methods
As shown in the previous diagram, there are 2 methods for writing an object to file.
The first one, the bean based method, describes the `*BeanCsvWriterBridge` configurations, 
which use the CSV writer libraries that have the option of writing beans to a CSV file. These implementations use the 
[reflection api](http://tutorials.jenkov.com/java-reflection/index.html) to extract bean information for schema generation and then use it to write values of a bean in the correct order. 
 
On the other hand, the non-bean based methods are implemented by decorating the `CsvWriterBridge` interface using a `Converter<T,String[]>` object converter and a `*StringArrayCsvWriterBridge`. The object converter encapsulates information regarding the schema, and is implemented in 2 different ways:

##### Explicit Schema Strategy
This strategy converts an object to a `String[]` by executing hardcoded method calls in a fixed order. In
 this example, the `ExplicitPersonConverter` performs the explicit conversion of a `Person` to a `String[]`:
 
```java
public class ExplicitPersonConverter implements Converter<Person, String[]> {
  @Override
  public String[] convert(Person person) {
    return new String[]{
        person.getId().toString(),
        person.getFirstName(),
        person.getLastName(),
        person.getAge().toString()
    };
  }
}
```

and the order of the method calls corresponds to the order of the field names defined in a different file called `PersonSchema`:

```java
public enum PersonSchema implements SchemaField<Person> {
  id("personId"),
  firstName("personFirstName"),
  lastName("personLastName"),
  age("personAge");

  private final String fieldName;
  private final String alternativeFieldName;
  private final Function<Person, Object> getter;
  
  PersonSchema(String alternativeFieldName) {
    this.fieldName = name();
    this.alternativeFieldName = alternativeFieldName;
    this.getter = null; // not used for the Explicit Schema Strategy
  }
  
  // Getters ...
}
```
 
The issue with this strategy is that the order of the method calls performed on the `Person` object are fixed. This means, if the
 order of the `PersonSchema` enumeration changes, the order of the `Person` getter method calls in 
 `ExplicitPersonConverter` must be changed as well. This coupling is a maintenance nightmare when defined in different locations. If the developer changes the order in 
 `PersonSchema`, even if the `convert` method was embedded into the `PersonSchema` class, the developer must 
 __remember__ to update both portions of the code. All of the `*_EXPLICIT` configurations defined in `PersonCsvWriterFactory` are used to illustrate this __poor design__ when the schema field order falls out of sync with the `convert` method definition in `ExplicitPersonConverter`, which also does not satisfy __Rule 1__. 
  
##### Lambda Schema Strategy

In contrast, the _Lambda Schema Strategy_ __does__ satisfy __Rule 1__ by using [method references](https://marcin-chwedczuk.github.io/method-references-in-java-8), which are a Java 8 feature. Previously, we saw that `ExplicitPersonConverter` did not map `Person` method calls to field names, but instead required manual human synchronization between the schema and the order of method calls. To incorporate method references, the constructor for `PersonSchema` is modified to store the method reference:

```java
public enum PersonSchema implements SchemaField<Person> {
  id("personId",Person::getId),
  firstName("personFirstName", Person::getFirstName),
  lastName("personLastName", Person::getLastName),
  age("personAge", Person::getAge);

  private final String fieldName;
  private final String alternativeFieldName;
  private final Function<Person, Object> getter; //Method reference to Person getter method

  PersonSchema(String alternativeFieldName, Function<Person, Object> getter) {
    this.fieldName = name();
    this.alternativeFieldName = alternativeFieldName;
    this.getter = getter;
  }
  
  //Getters
}
```
Now that `Person` value retrieval (i.e the getter method reference) is coupled with the field name definition, the need for human synchronization is no longer needed. The `LambdaConverter` uses the schema to iterate through all the getter method references in order, and apply them to the object being converted, as shown in the code below.
```java
public class LambdaConverter<T> implements Converter<T, String[]> {
  private final SchemaField<T>[] schema;
  
  private LambdaConverter(SchemaField<T>[] schema) {
    this.schema = schema;
  }

  @Override
  public String[] convert(T object) {
    return Arrays.stream(schema) // stream the SchemaField<T> objects in order
        .map(SchemaField::getGetter) // get the getter from the SchemaField object
        .map(getter -> getter.apply(object)) // apply that getter method to the object
        .map(Object::toString)
        .toArray(String[]::new);
  }
}
```
Using this class and `PersonSchema`, a `LambdaConverter<Person>` can be constructed with the code below

```java
LambdaConverter<Person> lambdaPersonConverter = new LambdaConverter<>(PersonSchema.getSchema());
```
Thus, no additional modifications need to be made to the `LambdaConverter` when `PersonSchema` changes the order of its fields, which is why this strategy satisfies __Rule 1__. 


##### Decoration
Lastly, the `*StringArrayCsvWriterBridge` configurations are combined with the `Converter<Person,String[]>` implementation to construct the `StringArrayCsvWriterDecorator`. Recall that the `*StringArrayCsvWriterBridge` uses an external library to write a `String[]` to a CSV file. This implementation has no concept of a schema, as its sole purpose is to write a `String[]` to a CSV file while adhering to RFC-4180. In order achieve the design depicted in [Figure 1](#figure-1), the [decorator design pattern](https://dzone.com/articles/is-inheritance-dead) is used to extend the functionality of a `CsvWriterBridge<String[]>` implementation using an object converter implementation. The class `StringArrayCsvWriterDecorator`, shown below, can write a `Person` object to a CSV file by constructing it with a `Converter<Person,String[]>` and `*StringArrayCsvWriterBridge` implementation.

```java
public class StringArrayCsvWriterDecorator<T> implements CsvWriterBridge<T> {
  private final CsvWriterBridge<String[]> arrayCsvWriter;
  private final Converter<T, String[]> converter;

  public StringArrayCsvWriterDecorator( CsvWriterBridge<String[]> arrayCsvWriter,
      Converter<T, String[]> converter) {
    this.arrayCsvWriter = arrayCsvWriter;
    this.converter = converter;
  }

  @Override public void write(T object) throws IOException {
    String[] data = converter.convert(object);
    arrayCsvWriter.write(data);
  }

  @Override public void writeHeader() throws IOException {
    this.arrayCsvWriter.writeHeader();
  }

  @Override public void close() throws IOException {
    if (this.arrayCsvWriter != null){
      this.arrayCsvWriter.close();
    }
  }
}
```


Using all the code defined thus far, any configuration can easily be constructed. For example, the following code constructs the `SUPER_CSV_LAMBDA` configuration:

```java
//1. Build the context
CsvWriterBridgeContext context = CsvWriterBridgeContext.<Person>builder()
            .setOutputDirPath(Paths.get("/some/output/directory"))
            .setUseDisk(USE_DISK) // write the file to disk
            .setQuote(SINGLE_QUOTE) // use a single quote for quoting
            .setSeparator(TAB) // use the the tab character as the column separator
            .setSchema(PersonSchema.getSchema())
            .build("SUPER_CSV_LAMBDA");  // creates a writer with the file name "SUPER_CSV_LAMBDA.output.csv"

//2. Build the StringArrayCsvWriterBridge
CsvWriterBridge<String[]> csvWriterBridge = new SuperCsvStringArrayCsvWriterBridge<>(context);

//3. Build the lambda converter
Converter<Person, String[]> lambdaConverter = new LambdaConverter<>(PersonSchema.getSchema());

//4. Decorate the StringArrayCsvWriterBridge with the lambda converter
CsvWriterBridge<Person> personCsvWriterBridge = new StringArrayCsvWriterDecorator<>(csvWriterBridge, lambdaConverter);
```

Finally, this design adheres to __Rule 3__ since the underlying data models (`Person` and `PersonBean`) remain unmodified. This is a critical point since many libraries such as OpenCSV and jackson-dataformat-csv use annotation processing of bean fields for configuring a CSV schema.

#### Execution

As mentioned earlier, 3 external CSV processing libraries were used (SuperCSV, OpenCSV, jackson-dataformat-csv) 
and a simple solution. The following is a list of the 11 different configurations for all 4 libraries:

- __SUPER_CSV_BEAN__ (SuperCSV with bean based processing)
- __SUPER_CSV_EXPLICIT__ (SuperCSV with explicitly defined object conversion )
- __SUPER_CSV_LAMBDA__ (SuperCSV with lambda based object conversion )
- __OPEN_CSV_BEAN__ (OpenCSV with bean based processing)
- __OPEN_CSV_EXPLICIT__ (OpenCSV with explicitly defined object conversion )
- __OPEN_CSV_LAMBDA__ (OpenCSV with lambda based object conversion )
- __SIMPLE_EXPLICIT__ (simple naive CSV processor using explicitly defined object conversion)
- __SIMPLE_LAMBDA__ (naive java CSV processor using lambda based object conversion)
- __JACKSON_BEAN__ (jackson-dataformat-csv with bean based processing)
- __JACKSON_EXPLICIT__ (jackson-dataformat-csv with explicitly defined object conversion)
- __JACKSON_LAMBDA__ (jackson-dataformat-csv with lambda based object conversion)


Each one of these configurations completes the _Execution_ step shown in __Figure 5__, and then write a `List<PersonData>` containing data from __Table 1__ to a CSV file. After writing a CSV file for each configuration, they are compared against the expected results and amongst each other.

<center>
<figure style="width:325px;">
    <img src="{{site.urlimg}}robert_tisma/writing_csv_files/execution.svg" />
    <figcaption>Figure 5: Steps involved in Execution stage  </figcaption>
</figure>
</center>

 
<center>
| id | firstName | lastName   | age |
|----|-----------|------------|-----|
| 1  | Denis     | Ritchie    | 70  |
| 2  | Frank     | Rosenblatt | 43  |
| 3  | Alex      | Murphy     | 37  |
</center>

###### Table 1: Example data

### Testing

In addition to explaining the design, each configuration was tested by varying the separator character, the quote character, and the order of the headers. The output CSV files, were all compared to a __GOLDEN__ reference representing the _expected_ CSV file contents, which verified the correctness of each configuration and helped identify issues. Since all the tests in the source code pass, the results of each configuration can be deduced from the assertions that were used.

#### COMMA_SEP_NO_QUOTES_REGULAR_ORDER

In this test, the separator is the comma character `,`, quoting is disabled (by setting the quote character to the null character `\u0000`), and the order of the headers match the order defined in `PersonSchema`, which is `["id", "firstName", "lastName", "age"]`. The following JUnit test passes, and all configurations match the expected output CSV file, `GOLDEN_COMMA_SEP_NO_QUOTES_REGULAR_ORDER_PATH`.

```java
  @Test
  public void testCommaSepNoQuotesRegularOrder() throws IOException {
    final int shiftAmount = 0; // dont shift the schema fields
    final int skipFieldIndex = -1; // dont remove any fields
    TestRunner runner = runTest(COMMA, EMPTY_CHARACTER, shiftAmount, skipFieldIndex);
    assertFileContentsAreTheSame(
        GOLDEN__COMMA_SEP_NO_QUOTES_REGULAR_ORDER_PATH,
        runner.getSuperCsvLambdaPath(),
        runner.getSuperCsvBeanPath(),
        runner.getSuperCsvExplicitPath(),

        runner.getOpenCsvLambdaPath(),
        runner.getOpenCsvExplicitPath(),
        runner.getOpenCsvBeanPath(),

        runner.getSimpleLambdaPath(),
        runner.getSimpleExplicitPath(),

        runner.getJacksonBeanPath(),
        runner.getJacksonExplicitPath(),
        runner.getJacksonLambdaPath()
    );
  }
```

#### TAB_SEP_WITH_QUOTES_REGULAR_ORDER

In contrast to the previous test, this test uses the tab character `\t` as the separator, __with quotes__ and uses the regular order defined in `PersonSchema`. The JUnit test asserts that all configurations match the expected output CSV file, except for the `JACKSON_BEAN` configuration. By observing the `JACKSON_BEAN.output.csv` file contents:

``` 
"personId"      "personFirstName"       "personLastName"        "personAge"
1               "Denis"                 "Ritchie"               70
2               "Frank"                 "Rosenblatt"            43
3               "Alex"                  "Murphy"                37
```
it is clear that the `jackson-dataformat-csv` library adds quotes to string fields, and does not add quotes to numeric values. If this external library is used to read AND write CSV files, then it is perfectly fine to use. However, if it is used to write CSV files, and then another library reads that CSV file, an error may occur when the library parses the unquoted numeric field. 

```java
  @Test
  public void testTabSepWithDoubleQuotesRegularOrder() throws IOException {
    TestRunner runner = runTest(TAB, DOUBLE_QUOTE, 0, -1);

    //Assert that all the above methods produce the same output file
    assertFileContentsAreTheSame(
        GOLDEN__TAB_SEP_WITH_DOUBLE_QUOTES_REGULAR_ORDER_PATH,
        runner.getSuperCsvLambdaPath(),
        runner.getSuperCsvBeanPath(),
        runner.getSuperCsvExplicitPath(),

        runner.getOpenCsvLambdaPath(),
        runner.getOpenCsvExplicitPath(),
        runner.getOpenCsvBeanPath(),

        runner.getJacksonLambdaPath(),
        runner.getJacksonExplicitPath(),

        runner.getSimpleLambdaPath(),
        runner.getSimpleExplicitPath()
    );

    //Assert that only the JacksonBean configuration produces a different output than the others
    assertFileContentsAreAllDifferent(
        runner.getOpenCsvBeanPath(),
        runner.getJacksonBeanPath());
  }
```
#### COMMA_SEP_NO_QUOTES_ORDER_SHIFTED_BY_2

In this test, the separator is the comma character `,`, quotes are disabled, and the order from `PersonSchema` is shifted left by 2. For example, instead of regular header order `["id", "firstName", "lastName", "age"]`, the shifted order would be `["lastName", "age", "id", "firstName"]`. The purpose of this test is to assess which configurations can properly process fields defined in a different order, which partially satisfies __Rule 1__. The JUnit test below,

```java
  @Test
  public void testCommaSepNoQuoteOrderShiftedBy2() throws IOException {
    TestRunner runner = runTest(COMMA, EMPTY_CHARACTER, -2, -1); // Shift the PersonSchema left by 2
    assertFileContentsAreTheSame(
        GOLDEN__COMMA_SEP_NO_QUOTES_ORDER_SHIFTED_BY_2_PATH, //Golden reference
        runner.getJacksonBeanPath(),
        runner.getJacksonLambdaPath(),
        runner.getOpenCsvBeanPath(),
        runner.getOpenCsvLambdaPath(),
        runner.getSuperCsvBeanPath(),
        runner.getSuperCsvLambdaPath(),
        runner.getSimpleLambdaPath()
    );

    // Asserts that all *_EXPLICIT configurations have the same output
    assertFileContentsAreTheSame(
        runner.getJacksonExplicitPath(),
        runner.getOpenCsvExplicitPath(),
        runner.getSuperCsvExplicitPath(),
        runner.getSimpleExplicitPath()
    );

    // Effectively asserts ALL *_EXPLICIT configurations do not match the golden reference
    assertFileContentsAreAllDifferent(
        GOLDEN__COMMA_SEP_NO_QUOTES_ORDER_SHIFTED_BY_2_PATH,
        runner.getJacksonExplicitPath()
    );
  }
```
shows that all `*_EXPLICIT` configurations fail to write the correct data. Since they all use the same object converter implementation, the following output CSV file content is the same for all `*_EXPLICIT` configurations:

```
personLastName,personAge,personId,personFirstName
1,Denis,Ritchie,70
2,Frank,Rosenblatt,43
3,Alex,Murphy,37
```

It is evident that although the `personId` header name was rearranged, the data corresponding to it was not. This clearly fails __Rule 1__ and can be attributed to the __poor design__ of the object converter. Recall from the previous sections, all `*_EXPLICIT` configurations decorate a `*StringArrayCsvWriterBridge` with a `ExplicitPersonConverter`. Since the conversion of `Person` data to a `String[]` is hardcoded, 
when the schema field order is modified in one location (inside the `runTest` method), it is not automatically updated in the `ExplicitPersonConverter` class, which breaks __Rule 4__. In contrast, the `*_LAMBDA` configurations do not hardcode this conversion, and instead use the method references embedded in the schema fields to drive the conversion in the correct order.

#### COMMA_SEP_NO_QUOTES_1_LESS_HEADER

The configuration for this test is exactly the same as the `COMMA_SEP_NO_QUOTES_REGULAR_ORDER` test, except that one field is removed from the schema, and one configuration is skipped. The `OPEN_CSV_BEAN` configuration is skipped because the OpenCSV library errors when a field from the `PersonBean` class is not specified. The purpose of removing one field from the schema is to verify that a subset of fields can be written to file and adhere to __Rule 1__. The JUnit test below:

```java
  @Test
  @SuppressWarnings("unchecked")
  public void testCommaSepNoQuotes1LessHeader() throws IOException {
    TestRunner runner = runTest(COMMA, EMPTY_CHARACTER, 0, 1, OPEN_CSV_BEAN);

    // Assert all are the same
    assertFileContentsAreTheSame(
        GOLDEN__COMMA_SEP_NO_QUOTES_1_LESS_HEADER_PATH,
        runner.getJacksonLambdaPath(),
        runner.getOpenCsvLambdaPath(),
        runner.getSimpleLambdaPath(),
        runner.getSuperCsvBeanPath(),
        runner.getSuperCsvLambdaPath()
    );

    // Assert all Explicit configurations are the same
    assertFileContentsAreTheSame(
        runner.getJacksonExplicitPath(),
        runner.getOpenCsvExplicitPath(),
        runner.getSimpleExplicitPath(),
        runner.getSuperCsvExplicitPath()
    );

    // Assert that all explicit and JACKSON_BEAN configurations are different
    // and fail to match the golden reference
    assertFileContentsAreAllDifferent(
        GOLDEN__COMMA_SEP_NO_QUOTES_1_LESS_HEADER_PATH,
        runner.getJacksonBeanPath(),
        runner.getJacksonExplicitPath()
    );
  }
```

verifies 2 important points:

1. The `JACKSON_BEAN` configuration failed to remove the `id` field completely. Instead, it was appended at the end, which breaks __Rule 1__, as shown below:

```
personFirstName,personLastName,personAge
Denis,Ritchie,70,1
Frank,Rosenblatt,43,2
Alex,Murphy,37,3
```

2. The `*_EXPLICIT` configurations failed to remove the `id` field as well, because the `ExplicitPersonConverter` hardcodes the conversion. In order to correct this mistake, the `ExplicitPersonConverter` would have to be modified, which breaks __Rule 1__ and __Rule 4__. Here is the output:

```
personFirstName,personLastName,personAge
1,Denis,Ritchie,70
2,Frank,Rosenblatt,43
3,Alex,Murphy,37
```

## Conclusion

The design of the software used in this blog post demonstrates how the bridge pattern can be used to interface with various CSV processing libraries and how the decorator pattern can be used to extend functionality of a particular class without affecting other instances of that class. In addition, the design adheres to the SOLID principles making the software easy to understand and maintainable. By analysing how the configurations satisfy each rule defined in the objective section, the issues with different libraries are brought to light. In general, the bean based methods eliminate the need for defining data conversion, since the libraries use their own bean introspective strategies. The non-bean based methods demonstrate how to write data to CSV files without using bean introspection. The source code also provides a good example of how to configure or setup CSV writing for OpenCSV, SuperCSV, jackson-dataformat-csv and for a simple implementation. It also exemplifies poor design, by comparing the hardcoded object conversion in `ExplicitPersonConverter` to the non-hardcoded implementation in `LambdaConverter`. Overall, this blog post can be used as an example of how to compare or use different libraries with similar functionality in a cohesive and decoupled manner without altering frozen code.
