# :newspaper: OICR Software Engineering Page

<div>

<img align="left" src="logo.png" href="https://oicr.on.ca/programs/genome-informatics/" width="20%" hspace="20">

### _We are OICR's team of software engineers, infrastructure specialists, and bioinformaticians creating big-data tools that enable the minds of those advancing the knowledge and treatment of cancer._

</div>

See our website live [here](https://softeng.oicr.on.ca/).

<br />

# Table of Contents

### [:computer: Running a Local Instance](#computer-running-a-local-instance-1)

### [:arrow_up: Updating Content (non-posts)](#arrow_up-updating-content)

### [:memo: Writing Guide](writing_guide.md)

- Non-prescriptive guide covering best practices with structured templates included

<br />

# :computer: Running a Local Instance

This website relies on Jekyll, which is a Ruby-based static website generator. In order to facilitate installation and maintenance, we recommend using `rbenv` ([documentation here](https://github.com/rbenv/rbenv)).

_Note: when using Apple Silicon you will need to prefix the architecture to your commands, e.g. `arch -arm64 rbenv install -l`_

### **1. Clone this repo**

### **2. cd into the repo and run:**

```bash
gem install jekyll bundler
bundle install
sh serve.sh
```

# :arrow_up: Updating content

All site content (projects, team members, positions, ...) are located in `/_data/`, please edit those files in your own branch and submit pull requests towards gh-pages.

### **1. Setup a local up-to-date copy of the repository:**

```
git clone https://github.com/OICR/softeng-blog.git
cd softeng-blog
```

**(or) Pull recent changes:**

```
cd softeng-blog
git checkout gh-pages
git pull
```

### **2. Branch from gh-pages and push your branch to github.**

- This will create a new branch for your blog post and sync it with github
- Branch name can be your firstname_topic (for example: alexis_argo), branches can be deleted after merge

```
git checkout -b <branch>
git push -u origin <branch>
```

### **3. Make the changes you need.**

- We are using `kramdown` markdown converter. You can find out more about it here [kramdown](http://kramdown.gettalong.org). We highly recommend going through its syntax documentation
  to get yourself more familiar with the coding style.
- Images can be added as an absolute or a relative link. You can look at kramdown syntax documentation to find out about adding absolute links. For a relative link images you can upload them into your folder inside images directory `/images/firstname_lastname/image.png`
  - To refer them inside your blog post, use the image url from the site config as `{{ site.urlimg }}` and append relative link of your image. `{{ site.urlimg }}/firstname_lastname/image.png`

### **4. Sync your new branch with Github**

- At regular interval, push your content to Github.

```
git commit -a -m "Describe your changes"
git push
```

### **5. Create a Pull Request**

Once your content is ready for review, create a pull request from your new branch towards gh-pages.

https://help.github.com/articles/creating-a-pull-request/
