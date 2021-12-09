let requestURL = "data/videoresources.json";
let datarequestURL = "data/videoresourcesdata.json";
let request = axios.get(requestURL);
let datarequest = axios.get(datarequestURL);
axios.all([request, datarequest]).then(axios.spread((...responses) => {
    let maincontentContainer = document.getElementsByClassName('main-content')[0];
    //condition for checking if browser is Internet Explorer
    let webelements = responses[0].data;
    let videoresources = responses[1].data;
    let contentElement = document.createElement('div');
    contentElement.classList.add('content');
    contentElement.innerHTML = getContent(webelements);
    maincontentContainer.appendChild(contentElement);
    addVideoResources(videoresources);
    addfooter();

})).catch(errors => {
    console.log(errors);
})

let addVideoResources = function (videoresources) {
    let agencies_sort = ['NSF​', 'NIH', 'DoD', 'DOE', 'ED', 'NASA', 'NOAA', 'NEA', 'NEH', 'NIJ', 'SAMHSA', 'USDA']
    let distinctAgencies = getDistinctAttributes(videoresources, 'acronym');

    let navContent = createAgencyNavigation(distinctAgencies);
    let tabContent = buildAgencyVideos(distinctAgencies, videoresources);
    let maincontentContainer = document.getElementsByClassName('main-content')[0];
    appendMainContent(maincontentContainer, navContent + tabContent);
}

let createAgencyNavigation = function (distinctAgencies) {
    let navigationContent = '<ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">';
    for (let i = 0; i < distinctAgencies.length; i++) {
        let buttonContent = '';
        let agencyId = "agency" + i.toString();
        if (i == 0) {
            buttonContent = '<a class="nav-link active" id="pills-' + agencyId + '-tab" data-toggle="pill" href="#pills-' + agencyId + '" role="tab" aria-controls="pills-' + agencyId + '" aria-selected="true">' + distinctAgencies[i] + '</a>';
        }
        else {
            buttonContent = '<a class="nav-link" id="pills-' + agencyId + '-tab" data-toggle="pill" href="#pills-' + agencyId + '" role="tab" aria-controls="pills-' + agencyId + '" aria-selected="true">' + distinctAgencies[i] + '</a>';
        }

        let linkElement = '<li class="nav-item">' + buttonContent + '</li>';
        navigationContent = navigationContent + linkElement;
    }
    navigationContent += '</ul>';
    return navigationContent;
}

let buildAgencyVideos = function (distinctAgencies, videoresources) {
    let tabContent = '<div class="tab-content" id="pills-tabContent">';

    for (let i = 0; i < distinctAgencies.length; i++) {
        let agencyId = "agency" + i.toString();
        let agencyvideos = videoresources.filter(function (videoresource) {
            return videoresource.acronym == distinctAgencies[i];
        });

        if (i == 0) {
            tabContent += '<div class="tab-pane fade show active" id="pills-' + agencyId + '" role="tabpanel" aria-labelledby="pills-' + agencyId + '-tab">';
        }
        else {
            tabContent += '<div class="tab-pane fade" id="pills-' + agencyId + '" role="tabpanel" aria-labelledby="pills-' + agencyId + '-tab">';
        }
        tabContent += '<div class="sponsor-title-container"><h3 class="sponsor-title"><img class="logo" src="assets/sponsor_logos/' + agencyvideos[0].acronym.toLowerCase() + '.png">' + agencyvideos[0].agency.toString() + '</h3></div>';
        tabContent += buildVideos(agencyvideos);
        tabContent += '</div>';

    }
    tabContent += '</div>';
    return tabContent;
}

let buildVideos = function (agencyvideos) {
    let accordionCounter = 1;
    let videoElem = '<div class = "accordion" id = "accordionExample">';
    let distinctTypes = getDistinctAttributes(agencyvideos, 'type');
    distinctTypes.forEach(function (type) {
        let videos = agencyvideos.filter(function (video) {
            return video.type == type;
        });
        let videoContent = buildVideoContent(videos);
        let headerId = "collapse" + accordionCounter;
        let headingId = "heading" + accordionCounter;
        let childId = "child" + accordionCounter;
        videoElem += generateAccordionElem(1, headerId, headingId, "accordionExample", childId, videos[0].type, videoContent);
        accordionCounter++;
    });
    videoElem += '</div>';
    return videoElem;
}

let buildVideoContent = function (videos) {
    let content = '<ul class = "sub-list">';
    //var regex = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
    let weblinks = videos.filter(function (video) {
        return (video.link.includes("youtube") == false &&
            video.link.includes("youtu.be") == false &&
            video.link.includes(".mp4") == false);
    });

    for (let i = 0; i < weblinks.length; i++) {
        if (weblinks[i].text != '') {

            content = content + '<li><a target="_blank" href = "' + weblinks[i].link + '">' + weblinks[i].title + ' (' + weblinks[i].text + ')</a></li>';
        }
        else {
            content = content + '<li><a target="_blank" href = "' + weblinks[i].link + '">' + weblinks[i].title + '</a></li>';
        }
    }
    content = content + '</ul>';
    let youtubelinks = videos.filter(function (video) {
        return (video.link.includes("youtube") == true ||
            video.link.includes("youtu.be") == true ||
            video.link.includes(".mp4") == true);
    });

    content += '<div class="display-flex">';
    for (let i = 0; i < youtubelinks.length; i++) {
        let youtubelink = '';
        let link = youtubelinks[i].link;
        if (link.includes("user")) {
            channel_title = link;
        }
        if (link.includes("youtube") == true) {
            youtubelink = link.replace('watch?v=', 'embed/');
        }
        else if (link.includes("youtu.be") == true) {
            youtubelink = link.replace('youtu.be', 'www.youtube.com/embed/');
        }
        else {
            youtubelink = link;
        }

        var ampersandPosition = youtubelink.indexOf('&');
        if (ampersandPosition != -1)
            youtubelink = youtubelink.substring(0, ampersandPosition);
        if (youtubelinks[i].title.includes("Channel")) {
            content += '<div class="col-lg-4 col-md-4 col-sm-12 col-xs-12 video-padding-margin">' +
                '   <div class="videoWrapper wide-screen"><img src="assets/sponsor_logos/' + youtubelinks[i].acronym.toLowerCase() + '.png""></img></div>' +
                '   <a target = "_blank" href="' + youtubelink + '"><h5 class="video-title">' + youtubelinks[i].title + '</h5></a>' +
                '</div>';
        }
        else {
            content += '<div class="col-lg-4 col-md-4 col-sm-12 col-xs-12 video-padding-margin">' +
                '   <div class="videoWrapper wide-screen"><iframe  src="' + youtubelink + '" allowfullscreen="true" autoplay="false"></iframe></div>' +
                '   <a target = "_blank" href="' + youtubelink + '"><h5 class="video-title">' + youtubelinks[i].title + '</h5></a>' +
                '</div>';
        }



        addfooter();

    }
    content += '</div>';
    return content;

}

$('.carousel').carousel({
    pause: "false",
    interval: 2000

});