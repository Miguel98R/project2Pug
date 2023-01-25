<div align="center"><img  src="public/img/logo.png" /></div>
<br>
<div align="center"><em>html template converter to templates with pug as view engine </em></div>
<br>
<br>

Set a folder where the files to be found will be to be the input directory, so set a folder for the output files

Example of directory paths to enter:
- Input directory : /home/mike98/Desktop/html_files
- Output Directory : /home/mike98/Desktop/pug_files

---
# Install

```
git clone https://github.com/Miguel98R/project2Pug.git
```

```
npm install
```

```
npm run dev
```


# Install by npm

can also install the converter by npm

command:
```
npm i -g project2_pug
```
start converter interface

command:
```
gui
```
example usage:
```
project2_pug gui
```

Then visit http://localhost:3008/*

*By default start on port 3008 , this can be modified in the index.js file

---
# Convert CLI mode

Also has the option to convert your html template to pug via CLI


command:
```
convert
```
options:
```
-i, --inDirectory <inDirectory...>    location of the folder where the files to be converted are
-o, --OutDirectory <OutDirectory...>  location of the folder where the converted files will be saved
```

example usage:
```
project2_pug -i "/home/mike98/Desktop/html_files" -o "/home/mike98/Desktop/pug_files"
```

install node modules and start the server in the output folder

command:
```
star-dev
```
example usage:
```
project2_pug star-dev
```



---
# Initializing template converted

Once you have converted the template, you will notice that a structure has been created for your project ,
an api-rest based on js express and a database connection in mongo db, this to help in the process of creating projects

Converted views to pug are located in the views folder and static/library files are located in the public folder

to initialize the project simply install the node modules and run the dev command


```
npm install
```

```
npm run dev
```

in the CLI section, the command to install the node modules and start the server in the output folder is shown

The project to be launched on port 3055 , this can be modified in the index.js of your output folder  
Then visit  http:///localhost:3055/index *


Note: if in your template static files are in an **assets** folder, this folder will be saved in the **public** folder just move the contents to the root of the **public** folder for your template to work properly

---

<h4 align="center">Mike Rosas © 2023  | project2Pug v1.0.1</h4>
<h4 align="center">Developed by: Jose Miguel Rosas Jimenez</h4>


