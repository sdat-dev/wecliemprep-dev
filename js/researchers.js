window.onload = function () {
    let requestURL = "https://sdat-dev.github.io/resources/wecliemprep-dev/data/researchers.json"; 
    let datarequestURL = "https://sdat-dev.github.io/resources/wecliemprep-dev/data/researchersdata.json"; 
    // let requestURL = "../data/researchers.json"; 
    // let datarequestURL = "../data/researchersdata.json"; 
    let request =  axios.get(requestURL);
    let datarequest =  axios.get(datarequestURL);
    let maincontentContainer = document.getElementsByClassName('main-content')[0];
    axios.all([request, datarequest]).then(axios.spread((...responses) => {
        let researcherscontent =  responses[0].data;
        let researchers = responses[1].data;
        let webelements = researcherscontent;
        let content = getContent(webelements);
        content += '<input id = "search-box" placeholder = "Search Researchers...">'+
                    '<button id = "search-button" type = "submit"><i class="fa fa-search"></i></button>'+
                '<br><span id = "search-box-results"></span>';
        content +='<div id="experts-content">'+ buildUniversityResearchers("tab1",researchers)+'</div>';
        let contentElement = document.createElement('div');
        contentElement.classList.add('content');
        contentElement.innerHTML = content.trim();
        maincontentContainer.appendChild(contentElement);
        addfooter();
        let searchbox = document.getElementById('search-box');
        let searchbutton = document.getElementById('search-button');
        searchbox.onkeyup = searchfunction;
        searchbutton.onclick = searchfunction;

    })).catch(errors => {
        console.log(errors);
    })
}

//Start with level1 accordion and build one by one the levels going down.
//this is nestted accordion that can go upto 4 levels
let counter = 1;
let buildUniversityResearchers = function(tabId, tabexperts){
    let contactElem = '';
    contactElem +=  '<div class = "accordion-container">'+
                        '<div class="panel-group" id = "' + tabId + '" role="tablist" aria-multiselectable="true">';
    let distinctLevel1s = getDistinctAttributes(tabexperts, 'UAlbanyCollegeSchoolDivision');
    distinctLevel1s.sort();
    var index = distinctLevel1s.indexOf("");
    if(index != -1)
    {
        distinctLevel1s.splice(index, 1);
        distinctLevel1s.push("");
    }
    distinctLevel1s.forEach(function(level1) {
        let collapseId1 = "collapse" + counter;
        let headerId1 = "heading" + counter;
        let childId1 = "child" + counter;
        counter++;
        let level2Elem = '';
        //filter level2s
        let level2s = tabexperts.filter(function(expert){
            return expert.UAlbanyCollegeSchoolDivision == level1;
        }); 

        if(level2s.length > 0)
        {
            let distinctLevel2s = getDistinctAttributes(level2s, 'Department');
            distinctLevel2s.sort();
            distinctLevel2s.forEach(function(level2){
                //filter level3 
                let level3s = level2s.filter(function(expert){
                    return expert.Department == level2;
                });
                level3s.sort((a,b) => b.firstName - a.firstName)
                //for level2s build simple list
                level2Elem+= buildUniversityResearcherElements(level3s);
            });
        }  
        if(level1 == "")
        {
            level1 = "Other";
        }
        level1 += '<span class="noofresearchers"></span>';
        contactElem+= generateAccordionElem(1, collapseId1, headerId1, tabId, childId1, level1, level2Elem);
    });
    contactElem +=      '</div>'+
                    '</div>';
    //end level1 accordion
    return contactElem;
}

let buildUniversityResearcherElements = function(researchers){
    let content = '';
    for(var i=0; i< researchers.length; i++){
        if(researchers[i].FirstName == "") //skip of there is no first name
            continue;
        let researcher = researchers[i];
        content +='<div class = "search-container expert-info">'+
        '<img class = "expert-image" src = "https://sdat-dev.github.io/resources/wecliemprep-dev/assets/images/researchers/' + researcher.Email +'.jpg"/>'+
        '<h2 class = "content-header-no-margin">'+ (researcher["InstitutionalPage"] == ""? researcher.FirstName + ' '+ researcher.LastName : '<a class = "no-link-decoration" href = ' + getHttpLink(researcher["InstitutionalPage"]) + '>' + researcher.FirstName + ' '+ researcher.LastName + '</a>') + '</h2>'+
        '<h5 class = "content-header-no-margin faculty-title" style = "font-size:20px;">'+ (researcher.JobTitle != ''? researcher.JobTitle + ',<br>':'') + (researcher.Department != ''? researcher.Department :'') + '</h5>' +
        generateLogoContent(researcher) +'<p class = "faculty-description"><strong>Email: </strong> <a class = "email-link" href = mailto:' + researcher.Email + 
        '>'+ researcher.Email+ '</a><br>'+ (researcher.PhoneNumber != ""? '<strong>Phone: </strong>'+ formatPhone(researcher.PhoneNumber) + '<br>': "")+'<strong>Research Interests: </strong>'+ 
        getResearchInterests(researcher) + '</p><p>' + researcher.ResearchExpertise +'</p>'+ generateProjectsContent([researcher["Project1"],researcher["Project2"],researcher["Project3"],researcher["Project4"],researcher["Project5"]])+
        generateRelevantCourses([researcher["Course1"],researcher["Course2"],researcher["Course3"],researcher["Course4"],researcher["Course5"]]) + '</div>';
    }
    return content;
}

let generateLogoContent = function(expert){
    let onlineCVContent = (expert["CV"] == '')?'':
    '<a href = "'+ expert["CV"] +'"><img src = "https://sdat-dev.github.io/resources/wecliemprep-dev/assets/images/cv.png"></a>'; 
    let researchGateContent = (expert["ResearchGate"]== '')?'':
    '<a href = "'+ expert["ResearchGate"] +'"><img src = "https://sdat-dev.github.io/resources/wecliemprep-dev/assets/images/research-gate-logo.png"></a>'; 
    let googleScholarContent = (expert["GoogleScholar"] == '')?'':
    '<a href = "'+ expert["GoogleScholar"] +'"><img src = "https://sdat-dev.github.io/resources/wecliemprep-dev/assets/images/google-scholar-logo.png"></a>'; 
    let otherContent = (expert["Others"] == '')?'':
    '<a href = "'+ expert["Others"] +'"><img src = "https://sdat-dev.github.io/resources/wecliemprep-dev/assets/images/link.png"></a>'; 
    let linkContainer = '<div class = "display-flex icon-container">'+
    onlineCVContent + researchGateContent + googleScholarContent + otherContent + '</div>';
    return linkContainer;
}

let getResearchInterests = function(expert){
    let interests = "";
    interests += (expert["Keyword1"] == ''?  "" : expert["Keyword1"] +"; " )+ (expert["Keyword2"] == ''?  "":expert["Keyword2"] +"; ") + 
    (expert["Keyword3"] == ''?  "": expert["Keyword3"]+"; ") + (expert["Keyword4"]== ''?  "":expert["Keyword4"] +"; " )+
    (expert["Keyword5"] == ''?  "":expert["Keyword5"] +"; ") + (expert["Keyword6"]== ''?"":expert["Keyword6"]+"; ") +
     expert["Keyword7"] ; 
    return interests;
}

let generateProjectsContent = function(projects){
    let linkContent = '';
    let projectcount = 0;
    for(let i = 0; i < projects.length; i++)
    {
      if('' != projects[i])
      {
        linkContent = linkContent + '<li>'+ projects[i] + '</li>';
        projectcount++;
      }
    }
    linkContent = (projectcount > 0)?
    '<b class = "purple-font">Ongoing Research/Scholarship Related Projects</b><ul class = "sub-list">'
    + linkContent + '</ul>': '';
    return linkContent;
}

let generateRelevantCourses = function(courses){
    let courseContent = '';
    let count = 0;
    for(let i = 0; i < courses.length; i++)
    {
      if('' != courses[i])
      {
        courseContent = courseContent + '<li>'+ courses[i] + '</li>';
        count++;
      }
    }
    courseContent = (count > 0)?
    '<b class = "purple-font">RELEVANT COURSES</b><ul class = "sub-list">'
    + courseContent + '</ul>': '';
    return courseContent;
}

// Search Function
searchfunction = function () {
    //getting search-box Element
    let searchbox = document.getElementById('search-box');
    let searchtext = searchbox.value.trim();
    //let tabs =  document.getElementsByClassName('tab-pane');
    //getting individual content withing sub-accordions to toggle display
    let panels = document.getElementsByClassName('panel');
    let searchElems = document.getElementsByClassName('search-container');
    clearsearch();
    if (panels.length > 0) {
        for (let i = 0; i < panels.length; i++) {
            panels[i].style.display = "none";
        }
    }

    if (searchElems.length > 0) {
        for (let i = 0; i < searchElems.length; i++) {
            searchElems[i].style.display = "none";
        }
    }

    if(searchtext.length > 0)
    {
        let modifiedsearchtext = searchtext.replace(/\s+/g, '').toLowerCase();

        
        for(let i=0; i< panels.length; i++){
            let count = 0;
            let searchElems = panels[i].getElementsByClassName('search-container');
            for (let j = 0; j < searchElems.length; j++) {
                if (searchElems[j].textContent.replace(/\s+/g, '').toLowerCase().indexOf(modifiedsearchtext) >= 0) {
                    count++;
                    searchElems[j].style.display = "block";
                }
            }
            if(count > 0)
            {
                let solicount = panels[i].getElementsByClassName("noofresearchers");
                solicount[0].innerText = " ("+count+")";
                panels[i].style.display = "block";
            }
        }
    }
    else{

        clearsearch();
    } 
}


let clearsearch = function(){
    let panels = document.getElementsByClassName('panel');
    if (panels.length > 0) {
        for (let i = 0; i < panels.length; i++) {
            let searchElems = panels[i].getElementsByClassName('search-container');
            if (searchElems.length > 0) {
                for (let i = 0; i < searchElems.length; i++) {
                    searchElems[i].style.display = "block";
                }
            }
            let solicount = panels[i].getElementsByClassName("noofresearchers");
            solicount[0].innerText = "";
            panels[i].style.display = "block";
        }
    }
}

let formatPhone = function(text){
    let result = text;
    if(isNaN(text) == false){
        result = (text/10000000 |0)+ '-' + ((text/10000)%1000|0) + '-' + text%10000
    }
    return result;
}

let getHttpLink = function(link){
    let result = link;
    if(link != "" && link.indexOf("http") == -1){
        result = "https://" + link;
    }
    return result;
}

$('.carousel').carousel({pause: null});