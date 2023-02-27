//Global Variables
var currentDate = "20190902";
// var dataset = "mkgEnsemble";
var pastDate = "20180301";
var webModelPath = "/ajax/getimage?";
var initialTime = "1800";
var forecastType = "ens";
//var forecastprefix = "mkgEnsemble_";
var initialTime; //Initialization Time
var forecastHours; //Number of hours model is run
var forecastInterval, modelName; //Model period, name of model
var flList; //For list of forecast hours (i.e. fHHHMM)
var dateSelected;
var timeoutID = null;//Initalized timeout setting
var syncStatus = false;//For racing issue between slider and ajax
var looperSpeed = 500;//Intial speed of animation
var resetSpeed = 500;//Reset to initial speed
var currentSelection;

var disableddates_no_more = ["20190901"
    , "20190902"
    , "20190903"
    , "20190904"
    , "20190905"
    , "20190906"
    , "20190907"
    , "20190908"
    , "20190909"
    , "20190910"
    , "20190911"
    , "20190912"
    , "20190913"
    , "20190914"
    , "20190915"
    , "20190916"
    , "20190917"
    , "20190918"
    , "20190919"
    , "20190920"
    , "20190921"
    , "20190922"
    , "20190923"
    , "20190924"
    , "20190925"
    , "20190926"
    , "20190927"
    , "20190928"
    , "20190929"
    , "20190930"
    , "20191001"
    , "20191002"
    , "20191003"
    , "20191004"
    , "20191005"
    , "20191006"
    , "20191007"
    , "20191008"
    , "20191009"
    , "20191010"
    , "20191011"
    , "20191012"
    , "20191013"
    , "20191014"
    , "20191015"
    , "20191016"
    , "20191017"
    , "20191018"
    , "20191019"
    , "20191020"
    , "20191021"
    , "20191022"
    , "20191023"
    , "20191024"
    , "20191025"
    , "20191026"
    , "20191027"
    , "20191028"
    , "20191029"
    , "20191030"
    , "20191031"
    , "20191101"
    , "20191102"
    , "20191103"
    , "20191104"
    , "20191105"
    , "20191106"
    , "20191107"
    , "20191108"
    , "20191109"
    , "20191110"
    , "20191111"
    , "20191112"
    , "20191113"
    , "20191114"
    , "20191115"
    , "20191116"
    , "20191117"
    , "20191118"
    , "20191119"
    , "20191120"
    , "20191121"
    , "20191122"
    , "20191123"
    , "20191124"
    , "20191125"
    , "20191126"
    , "20191127"
    , "20191128"
    , "20191129"
    , "20191130"
    , "20191201"
    , "20191202"
    , "20191203"
    , "20191204"
    , "20191205"
    , "20191206"
    , "20191207"
    , "20191208"
    , "20191209"
    , "20191210"
    , "20191211"
    , "20191212"
    , "20191213"
    , "20191214"
    , "20191215"
    , "20191216"
    , "20191217"
    , "20191218"
    , "20191219"
    , "20191220"
    , "20191221"
    , "20191222"
    , "20191223"
    , "20191224"
    , "20191225"
    , "20191226"
    , "20191227"
    , "20191228"
    , "20191229"
    , "20191230"
    , "20191231"
    , "20200101"
    , "20200102"
    , "20200103"
    , "20200104"
    , "20200105"
    , "20200106"
    , "20200107"
    , "20200108"
    , "20200109"
    , "20200110"
    , "20200111"
    , "20200112"
    , "20200113"
    , "20200114"
    , "20200115"
    , "20200116"
    , "20200117"
    , "20200118"
    , "20200119"
    , "20200120"
    , "20200121"
    , "20200122"
    , "20200123"
    , "20200124"
    , "20200125"
    , "20200126"
    , "20200127"
    , "20200128"
    , "20200129"
    , "20200130"
    , "20200131"
    , "20200201"
    , "20200202"
    , "20200203"
    , "20200204"
    , "20200205"
    , "20200207"
    , "20200208"
    , "20200209"
    , "20200210"
    , "20200211"
    , "20200212"
    , "20200213"
    , "20200214"

]
var pname, fileType;
var currentDate = "";
var currentIsSummary = false;
var initialTime = "";

function setForecast(which) {
    if (which === "ens") {
        forecastType = "ens";
        forecastprefix = ensforecastprefix; //"mkgEnsemble_";
    } else if (which === "det") {
        forecastType = "det"; //"ens"
        forecastprefix = detforecastprefix; //"mkgControl_"; //"hkhEnsemble_"
    }
    currentSelection = null;
    //getDocument();
    loadDate($("#datepicker").datepicker().val() + initialTime);
}

function toggleForecast(isDet) {
    $('#cover').show();
    if (isDet) {
        setForecast("det");
    } else {
        setForecast("ens");
    }
}

function getDocument() {
    $.ajax({
        url: "ajax/getjson",
        type: 'GET',
        data: { "forecasttype": forecastType },
        success: function (result) {
            loadData(result);
            $("#datepicker").datepicker("setDate", getFormattedDate(currentDate).substring(0, 10));
            //initHandleVal();
        }
    });
}

function completeDatePicker(early, late) {
    $("#datepicker").datepicker({//Code handling date picker UI
        changeMonth: true,
        changeYear: true,
        defaultDate: 0,
        showOn: "button",
        buttonImage: "static/model_viewer/calendar.jpg",
        buttonImageOnly: true,
        buttonText: "Select Date",
        beforeShowDay: DisableSpecificDates,
        dateFormat: "yymmdd",
        minDate: early, //"20190502",//Earliest Date in DIR
        maxDate: late, //"20190506",//Current Date in DIR
        onSelect: function (dateText, instance) {
            loadDate(dateText + initialTime);
        }
    });
}

$(document).ready(function () {
    getDocument();

});

function DisableSpecificDates(date) {//Disables certain dates in datepicker calendar
    var string = jQuery.datepicker.formatDate('yymmdd', date);
    return [disableddates.indexOf(string) == -1];
}

//*********yyyymmddhh - "2019050218" ****//
function loadDate(which) {
    $.ajax({
        url: "ajax/getjson",
        type: 'GET',
        data: {
            "initdate": which,
            "forecasttype": forecastType
        },
        success: function (result) {
            loadData(result);
        }
    });
}

var resultarray = [];
function loadData(result) {

    var data = JSON.parse(result);
    var imageLoaded = false;
    var getMenuItem = function (itemData, isVariable, isSummaries) {
        if (!isSummaries) {
            var isSummaries = itemData.title == "Summaries" ? true : false;
        }
        var cssClass = "nav-item dropdown";
        var style = "";
        var role = "";
        var datatoggle = "";
        var ariahaspopup = false;
        var ariaexpanded = false;
        var acss = "dropdown-item";
        var item = $("<li>", { "class": cssClass })
        if (!itemData.group) {

            cssClass = "dropdown-submenu";
        } else {
            var hideAllDDOnClick = true;
        }
        if (!isVariable) {
            acss = "nav-link dropdown-toggle";
            role = "button";
            datatoggle = "dropdown";
            ariahaspopup = "true";
            ariaexpanded = "false";
            if (hideAllDDOnClick) {
                item.append(
                    $("<a>", {
                        id: (itemData.title ? itemData.title : itemData.name).replace(new RegExp("/", 'g'), "_").replace(new RegExp(" ", 'g'), "_"),
                        href: '#',
                        html: itemData.title ? itemData.title : itemData.name,
                        "class": acss,
                        role: role,
                        "aria-haspopup": ariahaspopup,
                        "aria-expanded": ariaexpanded,
                        "data-toggle": datatoggle,
                        onclick: hideAllDD,
                    }));
            } else {
                item.append(
                    $("<a>", {
                        id: (itemData.title ? itemData.title : itemData.name).replace(new RegExp("/", 'g'), "_").replace(new RegExp(" ", 'g'), "_"),
                        href: '#',
                        html: itemData.title ? itemData.title : itemData.name,
                        "class": acss,
                        role: role,
                        "aria-haspopup": ariahaspopup,
                        "aria-expanded": ariaexpanded,
                        "data-toggle": datatoggle,
                    }));
            }
        } else {
            item.append(
                $("<a>", {
                    id: (itemData.title ? itemData.title : itemData.name).replace(new RegExp("/", 'g'), "_").replace(new RegExp(" ", 'g'), "_"),
                    href: '#',
                    html: itemData.title ? itemData.title : itemData.description,
                    "class": acss,
                    role: role,
                }));
        }

        if (isVariable) {
            if (isSummaries) {
                if (!imageLoaded) {
                    if (currentIsSummary) {
                        if (currentSelection) {
                            imageLoaded = true;
                            loadImage(currentSelection, true);
                        } else {
                            loadImage(itemData.name, true);
                        }
                    }
                }
                item.on({
                    'click': function () {
                        $('#cover').show();
                        pauseLooper();
                        firstImage();
                        loadImage(itemData.name, true);
                        initializeSlider();
                        loadSlider();
                    }
                });
            } else {
                if (!imageLoaded) {
                    if (!currentIsSummary) {
                        if (currentSelection) {
                            loadImage(currentSelection);
                            imageLoaded = true;
                        } else {
                            if (data.config.defaultVariable.name == itemData.name) {
                                loadImage(itemData.name);
                                imageLoaded = true;
                            }
                        }
                    }
                }
                item.on({
                    'click': function () {
                        $('#cover').show();
                        pauseLooper();
                        firstImage();
                        loadImage(itemData.name);
                        initializeSlider();
                        loadSlider();
                    }
                });
            }
        }
        if (itemData.group) {
            var labelledby = (itemData.title ? itemData.title : itemData.name).replace(new RegExp("/", 'g'), "_").replace(new RegExp(" ", 'g'), "_");
            var subList = $("<ul>", {
                "class": "dropdown-menu border-0 shadow",
                "aria-labelledby": labelledby
            });
            if (Array.isArray(itemData.group)) {
                $.each(itemData.group, function () {
                    subList.append(getMenuItem(this, false, isSummaries));
                });
            } else {
                subList.append(getMenuItem(itemData.group, false, isSummaries));
            }

            item.append(subList);
        }
        if (itemData.variable) {
            var labelledby = (itemData.title ? itemData.title : itemData.name).replace(new RegExp("/", 'g'), "_").replace(new RegExp(" ", 'g'), "_");
            var subList = $("<ul>", {
                "class": "dropdown-menu border-0 shadow",
                "aria-labelledby": labelledby
            });
            $.each(itemData.variable, function () {
                subList.append(getMenuItem(this, true, isSummaries));
            });
            item.append(subList);
        }
        return item;
    };

    var $menu = $("#mymenu");
    forecastHours = data.config.forecastHours;
    forecastInterval = data.config.forecastInterval;
    pname = data.config.defaultVariable.name;
    modelName = data.config.modelExperimentName;
    fileType = data.config.imageType;
    currentDate = data.config.init.substring(0, 8);
    initialTime = data.config.init.substring(8);
    completeDatePicker(data.config.earliest.substring(0, 8), data.config.latest.substring(0, 8));
    $("#txtinit").text(getFormattedDate(data.config.init));
    $menu.empty();
    $.each(data.config.category, function () {
        resultarray.push(this);
        $menu.append(
            getMenuItem(this)
        );
    });

    loadLevels();
    initializeSlider();
    loadSlider();

    var item = $("<li>", { "class": "nav-item" });
    var link = $("<a/>", { class: "nav-link", html: "Info", style: "cursor:pointer" });
    link.click(function () { openInfo() });

    item.append(link)
    $menu.append(item);
}

function openInfo() {
    $('#mymodal').modal();
}

var myTimeOut;
function initHandleVal() {
    clearTimeout(myTimeOut);
    if (newmodelTimes[$("#forecastSlider").slider("value")]) {
        $("#custom-handle").text(newmodelTimes[$("#forecastSlider").slider("value")]);
    } else {
        myTimeOut = setTimeout(initHandleVal, 200);
    }
}

function getFormattedDate(str) {
    return str.substring(0, 4) + "/" + str.substring(4, 6) + "/" + str.substring(6, 8) + " : " + str.substring(8) + "00";
}

function showImage(i) {
    document.getElementById("imghero").src = loopImages[i];
};

//Used to speed up animations from speed up button
function speedUp() {
    if (looperSpeed > 125) {
        looperSpeed = looperSpeed / 2;
    };
};

//Used to slow down animations from speed down button    
function speedDown() {
    if (looperSpeed < 1000) {
        looperSpeed = looperSpeed * 2;
    };
};

//Displays the first image in the array from the first button
function firstImage() {
    $("#forecastSlider").slider("option", "value", 0);
};

//Displays the last image in the array from the last button 
function lastImage() {
    $("#forecastSlider").slider("option", "value", (flLength - 1));
};

//Steps through the image list to the next one temporally
function nextImage() {
    var handle = $("#custom-handle");
    var fSlider = $("#forecastSlider");
    var valCheck = fSlider.slider('value');
    fSlider.slider('value', fSlider.slider('value') + fSlider.slider("option", "step"));
    if (valCheck >= (loopImages.length - 1) || valCheck >= $("#forecastSlider").slider("option", "max")) {//Reaches the end of the list
        $("#forecastSlider").slider("option", "value", 0);
    }
};

//Steps through the image list to the previous one temporally
function prevImage() {
    var handle = $("#custom-handle");
    var fSlider = $("#forecastSlider");
    var valCheck = fSlider.slider('value');
    fSlider.slider('value', fSlider.slider('value') - fSlider.slider("option", "step"));
    if (valCheck == (0)) {//Reaches the beginning of the list
        $("#forecastSlider").slider("option", "value", (loopImages.length - 1));
    }
};


//Starts animation when play button is pressed
function slideLooper() {
    var handle = $("#custom-handle");
    var fSlider = $("#forecastSlider");
    var valCheck = fSlider.slider('value');
    fSlider.slider('value', fSlider.slider('value') + fSlider.slider("option", "step"));
    if (valCheck >= (loopImages.length - 1)) {
        $("#forecastSlider").slider("option", "value", 0);
    }
    timeoutId = setTimeout("slideLooper()", looperSpeed);
}

//Stops animation when stop button is pressed
function pauseLooper() {
    try {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        looperSpeed = resetSpeed;
    } catch (e) { }
}

function loadLevels() {
    // ------------------------------------------------------- //
    // Multi Level dropdowns
    // ------------------------------------------------------ //
    $("ul.dropdown-menu [data-toggle='dropdown']").on("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        $(this).siblings().toggleClass("show");
        if (!$(this).next().hasClass('show')) {
            $(this).parents('.dropdown-menu').first().find('.show').removeClass("show");
        }
        $(this).parents('li.nav-item.dropdown.show').on('hidden.bs.dropdown', function (e) {
            $('.dropdown-submenu .show').removeClass("show");
        });
    });
    $("#mymenu > li > a").on("click", hideAllDD);
}

function hideAllDD() {
    $('.dropdown-menu .show').removeClass("show");
}

function loadImage(which, isSummaries) {
    //ensmin-tmp2m
    //https://weather.msfc.nasa.gov/sport/dynamic/hinduKushEnsemble/20190902/hkhEnsemble_20190902-1800_f00100_ensmin-tmp2m.gif
    var hour = "f00100";
    if (which.indexOf("6h") > -1 ||
        which.indexOf("d05") > -1) {
        hour = "f00600";
    } else if (which.indexOf("12h") > -1) {
        hour = "f01200";
    } else if (isSummaries || which.indexOf("24h") > -1) {
        if (initialTime == 12 && which.indexOf("-max") > -1) {
            hour = "f03000";
        } else {
            hour = "f02400";
        }
    } else if (which.indexOf("mucaped") > -1 ||
        which.indexOf("d04") > -1 ||
        which.indexOf("relh") > -1 ||
        which.indexOf("soilt") > -1 ||
        which.indexOf("soilm") > -1 ||
        which.indexOf("gvf") > -1 ||
        which.indexOf("isot") > -1 ||
        which.indexOf("tmpc") > -1 ||
        which.indexOf("dwpc") > -1 ||
        which.indexOf("pwtr") > -1 ||
        // which.indexOf("sbcape") > -1 ||
        which.indexOf("scpd") > -1 ||
        which.indexOf("shipd") > -1 ||
        which.indexOf("tskin") > -1) {
        hour = "f00000";
    } else if (which.indexOf("3h") > -1) {
        hour = "f00300";
    }
    currentSelection = which;
    currentIsSummary = isSummaries;
    var qParameter = "imagename="
        + currentDate + initialTime
        + "/"
        + forecastType
        + "/"
        + forecastprefix
        + currentDate
        + "-"
        + initialTime
        + "00_"
        + hour
        + "_"
        + which
        + ".gif";
    $("#imghero").attr("src",
        "ajax/getimage?" + qParameter);
    $("#imghero").attr("alt", which);
    $("#imghero").attr("title", which);
    $('.dropdown-submenu .show').removeClass("show");
    hideAllDD();
}

function loadSlider() {
    var handle = $("#custom-handle");
    $("#forecastSlider").slider({
        min: 0,
        max: (loopImages.length - 1),//duration/interval,// + 1,
        step: 1,
        create: function () {//Done during slider creation
            handle.text(newmodelTimes[$(this).slider("value")]);
        },
        slide: function (event, ui) {//Done when slider is moved by user
            handle.text(newmodelTimes[ui.value]);
            showImage(ui.value);
        },
        change: function (event, ui) {//Done when slider is changed programmatically
            handle.text(newmodelTimes[ui.value]);
            showImage(ui.value);
        }
    });
}

// Determine the model times for the slider and for the file names
function calculateModelTimes(duration, interval) {
    var baseTime = 60;  // one hour or 60 minutes
    duration = parseInt(duration);//Needs to be a number, not a string
    interval = parseFloat(interval);//Needs to be a number, not a string
    var modelStep = baseTime * interval;
    var durationLength = duration / interval + 1;

    // Create arrays to hold the time strings for the slider and for
    // the filenames that will be generated
    var sliderString = [];
    var fileString = [];

    // All model runs have forecast starting at 0 hours, 0 minutes
    var hour = 0;
    var minutes = 0;

    // Fix if padStart isn't natively available i.e. EDGE browser
    if (!String.prototype.padStart) {
        String.prototype.padStart = function padStart(targetLength, padString) {
            targetLength = targetLength >> 0; //truncate if number or convert non-number to 0;
            padString = String((typeof padString !== 'undefined' ? padString : ' '));
            if (this.length > targetLength) {
                return String(this);
            }
            else {
                targetLength = targetLength - this.length;
                if (targetLength > padString.length) {
                    padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
                }
                return padString.slice(0, targetLength) + String(this);
            }
        };
    }

    // Create the time string arrays each formatted differently
    for (var i = 0; i < durationLength; i++) {

        var minuteString = minutes.toString().padStart(2, "0");
        sliderString[i] = "f" + hour.toString().padStart(3, "0");//Add "f" to the forecast times
        fileString[i] = "f" + hour.toString().padStart(3, "0") + minuteString;
        if (interval < 1) {//Add a min separator (:) for sub-hour data
            sliderString[i] += ":" + minuteString;
            minutes += modelStep;
            if (minutes >= 60) {
                minutes = 0;
                hour += 1;
            }
        } else {
            hour += interval;
        }
    }
    // Return the two arrays as objects
    return { sliderInfo: sliderString, fileInfo: fileString };
}

function initializeSlider() {
    // The following variables will be provided based on the XML configuration
    var duration = forecastHours;
    var interval = forecastInterval;  // Fractional hour
    var initializationTime = initialTime;
    // End XML configuration parameters

    // obtain an object with timeStrings
    var timeStrings = calculateModelTimes(duration, interval);
    // Extract the object elements (arrays)
    modelTimes = timeStrings.sliderInfo;
    var fileTimes = timeStrings.fileInfo;
    flList = timeStrings.fileInfo;
    mdList = timeStrings.sliderInfo;
    flLength = flList.length;
    createFileList();
    newmodelTimes = newmodelTimes.sort();
    loopImages = loopImages.sort();
    //syncSlider();
}

function createFileList() {
    nameList = [];//To be used to get list of filenames
    var k;
    var i;
    var item;
    var myxhr;
    var b;
    stopPoint = (flLength - 1);
    sliderStatus = false;
    loopImages = [];
    errorImages = [];
    newmodelTimes = [];
    var nameFile;
    for (var k = 0; k < flList.length; k++) {
        nameList.push(webModelPath + 'imagename=' + currentDate + initialTime + '/' + forecastType + '/' + forecastprefix + currentDate + '-' + initialTime + '00_' + flList[k] + '_' + currentSelection + '.' + fileType);
    };
    //Check to see what files are available and add them to loopImages and newmodelTimes Lists
    $.each(nameList, function (i, item) {
        myxhr = new XMLHttpRequest();
        myxhr.open("GET", item, true);
        myxhr.send(item);
        myxhr.onreadystatechange = function () {
            if (i < stopPoint) {
                if (this.readyState == 4 && this.status == 404) {//Missing File				
                    errorImages.push(item);
                } else if (this.readyState == 4 && this.status == 200) {//File exists
                    loopImages.push(item);
                    newmodelTimes.push(mdList[i]);
                    newmodelTimes = newmodelTimes.sort();
                    loopImages = loopImages.sort();
                };
            } else {//What to do with the last file
                if (this.readyState == 4 && this.status == 200) {
                    loopImages.push(item);
                    newmodelTimes.push(mdList[i]);
                    loopImages = loopImages.sort();
                    newmodelTimes = newmodelTimes.sort();
                    sliderStatus = true;
                } else if (this.readyState == 4 && this.status == 404) {
                    errorImages.push(item);
                    loopImages.sort();
                    loopImages = loopImages.sort();
                    newmodelTimes = newmodelTimes.sort();
                    sliderStatus = true;
                }
                loadSlider();
                initHandleVal();
            };
        }
    });

}