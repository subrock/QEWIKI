const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;
const https = require('https');
const http = require('http');

// Set the static directory for serving HTML, CSS, JS, etc.
// This assumes your HTML files are in a directory named 'public'
// in the same directory as your server.js file.
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));


let filename = 'myfile.txt';

function getFileContent(filename) {
    try {
        return fs.readFileSync(filename, 'utf-8');
    } catch (err) {
        if (err.code === 'ENOENT') {
            return '';
        }
        throw err;
    }
}

function saveFileContent(filename, content) {

const directoryPath = 'public/docs/'+filename;

// Check if the directory exists
if (fs.existsSync(directoryPath)) {
  // Remove the existing directory
  fs.rmSync(directoryPath, { recursive: true, force: true });
}

    fs.mkdirSync('public/docs/'+filename);
    //fs.writeFileSync('public/docs/'+filename+'/'+filename+'.txt', content, 'utf-8');

fs.writeFile('public/docs/'+filename+'/'+filename+'.txt', content, (err) => {
  if (err) {
    console.error('Error writing file:', err);
  } else {
    console.log('File overwritten successfully!');
  }
});
	
}


function encodeHTML(str) {
  return str.replace(/[&<>"']/g, function(match) {
    switch (match) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return match;
    }
  });
}

function processCodeBlocks(html) {
  return html.replace(/<code>(.*?)<\/code>/gs, (match, codeContent) => {
    const encodedCode = encodeHTML(codeContent);
    return `<code>${encodedCode}</code>`;
  });
}


app.post('/save', (req, res) => {
    const filename = req.body.filename;
    const newContent = req.body.content;
    saveFileContent(filename, newContent);
    res.send('File saved!');
});


app.get('/content', (req, res) => {
    filename = req.query.filename || filename;
    console.log(filename);
    const content = encodeHTML(getFileContent(filename));
	//console.log(content);
    //res.json({ content,filename });
	res.send('<pre>'+content+'</pre>');
});

app.get('/share', (req, res) => {
    const { id } = req.query;

    const textFilePath = path.join(__dirname, 'public/docs/'+id, id+'.txt');

    fs.readFile(textFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading text file:", err); // Corrected error logging
            return res.status(500).send("Error reading text file.");
        }

        const styledData = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quality Engineering Wiki</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
    <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet">
<style>

body {
  font-family: "Poppins", serif;
  font-weight: 400;
  font-style: normal;
  background: #fef5e7;
  padding: 20px;
}

pre {
  font-family: "Poppins", serif;
  font-weight: 400;
  font-style: normal;
      //height: 570px;
      width=100%;
  background: #fef5e7;
    ioverflow-y: scroll;
    white-space: pre-wrap;
word-wrap: break-word;
}
hr {
    border: 0;
    height: 1px;
    background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0));
}

hr {
    border: 0;
    border-bottom: 1px dashed #ccc;
    background: #000000;
}



code {
  -webkit-user-select: all;
  user-select: all;
  //display: block;
  padding: 3px;
  //border: 1px dashed #c9baa7;
  
  background-color: #eaecee;
  font-weight: light;
  text-align: left;
  font-family: monospace;
  overflow: auto;
}


</style>
</head>
<body>
<h4>${id}</h4>

   <pre>${data}</pre>

</body>
</html>
        `;

        res.send(processCodeBlocks(styledData)); // Send the STYLED data!
    });
});


app.get('/', (req, res) => {


	res.writeHead(302, {
  'Location': '/doc?id=Welcome%20to%20QE%20Training'
  //'Location': 'http://www.google.com'
  //add other headers here...
});
res.end();


});


app.get('/catalog', (req, res) => {

    const publicDir = path.join(__dirname, 'public/docs');
    fs.readdir(publicDir, (err, files) => {
        if (err) {
            console.error("Error reading directory:", err);
            return res.status(500).send("Error reading directory.");
        }

        let fileListHTML = '<ul>';
        files.forEach(file => {
            // Check if it's an HTML file (optional)
            if (path.extname(file).toLowerCase() === '.html' || path.extname(file) === '')
            {
                fileListHTML += `<li><a href="/doc?id=${file}">${file}</a></li>`;
            }
            else{
                fileListHTML += `<li>${file}</li>`;
            }

        });
        fileListHTML += '</ul>';

const styledData = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quality Engineering Wiki</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
    <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet">
<style>

body {
  font-family: "Poppins", serif;
  font-weight: 400;
  font-style: normal;
  background: #fdf2e9;
}

pre {
  font-family: "Poppins", serif;
  font-weight: 400;
  font-style: normal;
      height: 570px;
      width=100%;
    ioverflow-y: scroll;
    white-space: pre-wrap;
word-wrap: break-word;
}
hr {
    border: 0;
    height: 1px;
    background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0));
}

hr {
    border: 0;
    border-bottom: 1px dashed #ccc;
    background: #000000;
}

}

code {
  font-family: MyFancyCustomFont, monospace;
  font-size: inherit;
}

/* Code in text */
p > code,
li > code,
dd > code,
td > code {
  background: #ffeff0;
  word-wrap: break-word;
  box-decoration-break: clone;
  padding: .1rem .3rem .2rem;
  border-radius: .2rem;
}

</style>
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <a style="background; #fdf2e9;" class="navbar-brand" href="/">QEWIKI</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      </button>
      
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto"> 
          <li class="nav-item">
            <a class="nav-link" href="/">Welcome</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/catalog">Catalog</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/doc?id=About%20QE%20Training">About</a>
          </li>
        </ul>
        <form class="d-flex" role="search" action="/search" method="GET"> 
	
          <input class="form-control me-2" type="search" placeholder="Search Docs" aria-label="Search" name="q">
          <button class="btn btn-outline-light" type="submit">Search</button>
        </form>
      </div>
    </div></p>
  </nav>


    <div class="container">
<br>        <p>This is the main page of the training documentation. Use the navigation above to explore the different sections.</p>


         <div class="card w-100">
                 <div class="card-header"><strong>Document Catalog</strong>
                 </div>
            <div class="card-body" style="height: 600px;">

<pre>${fileListHTML}</pre>


            </div>

        </div>
    </div>

</body>
</html>
        `;

        res.send(styledData);
    });

});

app.get('/doc', (req, res) => {
    const { id } = req.query;

    const textFilePath = path.join(__dirname, 'public/docs/'+id, id+'.txt');

    fs.readFile(textFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading text file:", err); // Corrected error logging
            return res.status(500).send("Error reading text file.");
        }

        const styledData = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quality Engineering Wiki</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
    <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
<style>

body {
  font-family: "Poppins", serif;
  font-weight: 400;
  font-style: normal;
  background: #fdf2e9;
}

pre {
  font-family: "Poppins", serif;
  font-weight: 400;
  font-style: normal;
      height: 570px;
      width=100%;
    ioverflow-y: scroll;
    white-space: pre-wrap;
word-wrap: break-word;
}
hr {
    border: 0;
    height: 1px;
    background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0));
}

hr {
    border: 0;
    border-bottom: 1px dashed #ccc;
    background: #000000;
}



code {
  -webkit-user-select: all;
  user-select: all;
  //display: block;
  padding: 3px;
  //border: 1px dashed #c9baa7;
  
  background-color: #eaecee;
  font-weight: light;
  text-align: left;
  font-family: monospace;
  overflow: auto;
}


</style>
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <a style="background; #fdf2e9;" class="navbar-brand" href="/">QEWIKI</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
      </button>
     <br> 
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <a class="nav-link" href="/">Welcome</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/catalog">Catalog</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/doc?id=About%20QE%20Training">About</a>
          </li>
        </ul>
        <form class="d-flex" role="search" action="/search" method="GET"> 
	
          <input class="form-control me-2" type="search" placeholder="Search Docs" aria-label="Search" name="q">
          <button class="btn btn-outline-light" type="submit">Search</button>
        </form>
      </div>
    </div></p>
  </nav>


    <div class="container">
<br>        <p>This is the main page of the training documentation. Use the navigation above to explore the different sections.</p>


         <div class="card w-100">

   <div class="card-header"><strong>${id}</strong>
&nbsp;&nbsp;&nbsp;
   <a target=_blank href="share?id=${id}"><i class="fa fa-share-alt"></i></a>

                 </div>
            <div class="card-body" style="height: 600px;">

<pre>${data}</pre>


            </div>

        </div>
    </div>

</body>
</html>
        `;

        res.send(processCodeBlocks(styledData)); // Send the STYLED data!
    });
});


// Search Route
app.get('/search', (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.send("Please enter a search query.");
    }

    const publicDir = path.join(__dirname, 'public/docs');
    fs.readdir(publicDir, (err, files) => {
        if (err) {
            console.error("Error reading directory:", err);
            return res.status(500).send("Error reading directory.");
        }

        let results = [];
        files.forEach(file => {
            const filePath = path.join(publicDir, file, file + '.txt');
            try {
                const fileContent = fs.readFileSync(filePath, 'utf8');
                if (fileContent.toLowerCase().includes(query.toLowerCase())) {
                    results.push({ title: file, link: `/doc?id=${file}` });
                }
            } catch (readError) {
                // Handle errors reading individual files (e.g., if it's not a text file)
                console.error(`Error reading file ${file}:`, readError);
            }
        });

        let searchResultsHTML = '';
        if (results.length === 0) {
            searchResultsHTML += "<p>No results found.</p>";
        } else {
            searchResultsHTML += "<ul>";
            results.forEach(result => {
                searchResultsHTML += `<li><a href="${result.link}">${result.title}</a></li>`;
            });
            searchResultsHTML += "</ul>";
        }
	const styledData = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quality Engineering Wiki</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
    <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet">
<style>

body {
  font-family: "Poppins", serif;
  font-weight: 400;
  font-style: normal;
  background: #fdf2e9;
}

pre {
  font-family: "Poppins", serif;
  font-weight: 400;
  font-style: normal;
      height: 570px;
      width=100%;
    ioverflow-y: scroll;
    white-space: pre-wrap;
word-wrap: break-word;
}
hr {
    border: 0;
    height: 1px;
    background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0));
}

hr {
    border: 0;
    border-bottom: 1px dashed #ccc;
    background: #000000;
}

}

code {
  font-family: MyFancyCustomFont, monospace;
  font-size: inherit;
}

/* Code in text */
p > code,
li > code,
dd > code,
td > code {
  background: #ffeff0;
  word-wrap: break-word;
  box-decoration-break: clone;
  padding: .1rem .3rem .2rem;
  border-radius: .2rem;
}

</style>
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <a style="background; #fdf2e9;" class="navbar-brand" href="/">QEWIKI</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      </button>
      
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto"> 
          <li class="nav-item">
            <a class="nav-link" href="/">Welcome</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/catalog">Catalog</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/doc?id=About%20QE%20Training">About</a>
          </li>
        </ul>
        <form class="d-flex" role="search" action="/search" method="GET"> 
	
          <input class="form-control me-2" type="search" placeholder="Search Docs" aria-label="Search" name="q">
          <button class="btn btn-outline-light" type="submit">Search</button>
        </form>
      </div>
    </div></p>
  </nav>


    <div class="container">
<br>        <p>This is the main page of the training documentation. Use the navigation above to explore the different sections.</p>


         <div class="card w-100">
                 <div class="card-header"><strong>Search Results</strong>
                 </div>
            <div class="card-body" style="height: 600px;">

<pre>${searchResultsHTML}</pre>


            </div>

        </div>
    </div>

</body>
</html>
        `;

        res.send(styledData);
    });
});

// 404 handler (important!)
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html')); // Or a simple message
});



app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});


//https.createServer({
//        key: fs.readFileSync("/etc/letsencrypt/live/subrock.com/privkey.pem"),
//        cert: fs.readFileSync("/etc/letsencrypt/live/subrock.com/fullchain.pem")
//}, app).listen(443);



