
const KEY_API = "DEMO_KEY";

/**
 * show modal in error messages
 * @param title - the modal title
 * @param body - the body text
 */
const showModal = function(title, body) {
    const modal = new bootstrap.Modal(document.getElementById('errorModel'));
    document.getElementById('title').innerText = title;
    document.querySelector('#errorModel .modal-body').innerHTML = body;
    modal.show();
}
/**
 * handle spinner of the page
 * @type {{show: showSpinner, remove: removeSpinner}} - return the function that will show and remove the spinner
 */
const spinner =
    (function () {
        /**
         *  show the spinner and block page
         */
    const showSpinner = function() {
        let loadingOverlay = document.getElementById('spinner-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('d-none');
            document.body.style.overflow = 'hidden';
        }
    };
        /**
         * remove the spinner from page
         */
    const removeSpinner = function() {
        let loadingOverlay = document.getElementById('spinner-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('d-none');
            document.body.style.overflow = 'visible';
        }
    };
    return {
        show: showSpinner,
        remove: removeSpinner
    }
})();
/**
 * handle the HTML syntax will creat HTML element in page
 * @type {{noImagesFound: string, list: (function(*, *, *, *): string), carousel: (function(*, *, *): string), card: (function(*, *, *, *, *, *): string)}}
 *  return the HTML of no Image found
 *  return element of list for the saved pic
 *  return the inner of carousel item
 *  return  the HTML of the cards of the pics
 */
const HTMLSyntax =
    (function () {
        /**
         * return card html item with the given data
         * @param src - string url of pic src
         * @param Edate - string earth date of pic
         * @param sol - string number of sol of pic
         * @param camera - string rover type of camera
         * @param rover - string rover type of pic
         * @param id - string id of pic
         * @returns {HTML of card: string}
         */
        const card = function(src, Edate, sol, camera, rover, id) {
            return ` <div class="col"> <div class="card h-100">
    <img class="card-img-top" src='${src}' alt="Card image cap">
    <div class="card-body"><ul class="list-group list-group-flush">
            <li class="list-group-item d-none">${id}</li>
            <li class="list-group-item"> <b> Earth Date:</b>  ${Edate} </li>
            <li class="list-group-item"> <b> Sol: </b>  ${sol} </li>
            <li class="list-group-item"> <b> Camera: </b>  ${camera} </li>
            <li class="list-group-item"> <b> Mission: </b> ${rover} </li>
            <li class="list-group-item"></li></ul>
        <button type="button" class="btn btn-secondary toast-btn"> Save </button>
        <a href="${src}" class="btn btn-secondary" target="_blank"> Full Size</a>
        </div></div></div>`;
        }
        /**
         * return list html item with the given data
         * @param date - string earth date of pic
         * @param camera - string rover type of camera
         * @param sol - string number of sol of pic
         * @param id - string id of pic
         * @returns {HTML of list}
         */
        const list = function(date, camera, sol, id) {
            return `<li class="list-group-item d-flex justify-content-between align-items-start">
        <div class="ms-2 me-auto">
            <div class="fw-bold d-inline-block"> ${camera}</div>
            <span class="badge bg-primary rounded-pill ms-2"> id: ${id}</span>
            <br> ${date}, ${sol} <br> </div>
        <button type="button" class="btn btn-secondary" onclick="onClickFunctions.deleteItem(${id})"> delete </button></li>`;
        }
        /**
         * return carousel html item with the given data
         * @param src - string url of pic src
         * @param date - string earth date of pic
         * @param camera  - string rover type of camera
         * @returns {carousel item HTML}
         */
        const carousel = function(src,date,camera) {

            return `<div class="carousel-item">
            <img src="${src}" class="d-block w-100" alt="...">
            <div class="carousel-caption d-none d-md-block">
                <p> ${date} </p> <p> ${camera} </p>
                <a href="${src}" class="btn btn-dark" target="_blank"> Full Size</a>
            </div> </div>`;

        };

        const NO_PICTURES_HTML = `<div class="card text-bg-dark" style="width: 30rem;">
                         <div class="card-body"> <h5 class="card-title"> No images found! </h5>
                   <p class="card-text"> Try selecting new Date, Sol or Rover .</p> </div> </div>`;
        
        return {
            card: card,
            list: list,
            carousel: carousel,
            noImagesFound: NO_PICTURES_HTML
        }
    })();
/**
 * handle API request
 * @type {{getCards: getPictures, - function to get API request of images data 
 * cameraOptions: *[], - the camera html selection 
 * roverData: (function(*): *), - rover data dictionry in index
 * getData: getData}  - function to get API request of rover data
 */
const handleAPI = (function() {
        let html_content = [];
        let rover_data = [];
        /**
         * cover data to json 
         * @param response - the data from the API 
         * @returns {any} - the response data in json format
         */
        const json = function(response) {
            return response.json();
        };
        /**
         * return the status of the response
         * @param response - response from fetch
         * @returns {Promise<never>|Promise<Awaited<*>>} - promise either succeeded or failed  
         */
        const status = function(response) {
            if (response.status >= 200 && response.status < 300) {
                return Promise.resolve(response)
            } else {
                return Promise.reject(new Error(response.statusText))
            }
        };
        /**
         * handle the request of getting rover pics and adding it to html file 
         * @param url - string url of the API request
         */
        const getPictures = function(url) {
            fetch(url)
                .then(status)
                .then(json)
                .then(function (data) {
                    if (data.photos.length !== 0) {
                        Object.keys(data.photos).forEach(i => {
                            let newCard = HTMLSyntax.card(data.photos[i].img_src,
                                data.photos[i].earth_date, data.photos[i].sol,
                                data.photos[i].camera.name,
                                data.photos[i].rover.name, data.photos[i].id);
                            document.getElementById('result').insertAdjacentHTML('beforeend', newCard);
                        });
                    } else {
                        document.getElementById("result").innerHTML = HTMLSyntax.noImagesFound;
                    }
                    spinner.remove();
                }).catch(function (error) {
                showModal('Request failed!', "Search did not return a valid response, try again later");
            });
        };
        /**
         *  handle API rover data request to get the wanted rover data 
         *  and add the data to dictionary and to the HTML page
         */
        const getData = function() {
            fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/?api_key=${KEY_API}`)
                .then(status)
                .then(json)
                .then(function (data) {

                    let content_rover = `<option selected disabled value=""> Select Rover... </option>`;
                    let content_cameras = ``;
                    let dic = {name: '', landing_date: '', max_date: '', max_sol: '', cameras: []};
                    rover_data = Array.from({length: data.rovers.length}, () => ({...dic}));

                    Object.keys(data.rovers).forEach(i => {
                        rover_data[i].name = data.rovers[i].name;
                        rover_data[i].landing_date = data.rovers[i].landing_date;
                        rover_data[i].max_date = data.rovers[i].max_date;
                        rover_data[i].max_sol = data.rovers[i].max_sol;
                        rover_data[i].cameras = data.rovers[i].cameras;
                        content_rover += `<option value="${i}">${rover_data[i].name}</option>`;
                        content_cameras = `<option selected value="-1"> Select Camera... </option>`;

                        Object.keys(rover_data[i].cameras).forEach(j => {
                            content_cameras += `<option value="${rover_data[i].cameras[j].name}"> ${rover_data[i].cameras[j].full_name} </option>`;
                        });

                        html_content.push(content_cameras);
                    });


                    document.querySelector("#rovers").innerHTML = content_rover;
                    document.querySelector("#cameras").innerHTML = html_content[0];
                    spinner.remove();

                }).catch(function (error) {
                showModal('Request failed!', "Search did not return a valid response, try again later");
            });
        }
        /**
         * return the dictionary data
         * @param index - the index we want data from
         * @returns {rover_data} - the dictionary in index "index"
         */
        const getDictionaryAt = function(index) {
            return rover_data[index];
        }
        return {
            getCards: getPictures,
            getData: getData,
            cameraOptions: html_content,
            roverData: getDictionaryAt
        };
    })();
/**
 * send API request to read data for one time to adjust the input values
 */
const readData = (function () {
    let start = true;
    return function () {
        if (start) {
            spinner.show();
            handleAPI.getData()
            start = false;
        }
    };
    })();
/**
 * handle the rover selection set the min max attribute of the date and the sol
 * show model is there an already invalid chosen date
 * @type {{handleRoverSelection: selection, handleDateFormatSelection: handleDateFormatSelection}}
 */
const roverSelection = (function () {
    let dateError = 'Invalid Selection';
    let solError = 'Invalid Selection';
    let maxDate = new Date().toISOString().split('T')[0];
    let minDate = '-';
    let maxSol = '-';
    /**
     * handle the rover selection set the min max attribute of the date and the sol
     * show model is there an already invalid chosen date
     * @param val - the chosen rover
     */
    const selection = function (val) {

        let choice = parseInt(val, 10);
        let options = handleAPI.cameraOptions
        let error = dateError;

        if (!isNaN(choice) && choice >= 0 && choice < options.length) {
            document.querySelector("#cameras").innerHTML = options[choice];
            let roverData = handleAPI.roverData(choice)
            
            maxDate = roverData.max_date;
            minDate = roverData.landing_date;
            maxSol =  roverData.max_sol
            dateError = "The Date should be between " + minDate + ' and ' + maxDate;
            solError = "The SOL should be between 0 " + ' and ' + maxSol;
            
            const dateVal = document.getElementById("dates").value;
            const formatElement = document.getElementById("numberOrDate");
            
            if (dateVal === '1') {
                formatElement.setAttribute('min', minDate);
                formatElement.setAttribute('max', maxDate);
                error = dateError;
            }
            if (dateVal === '2') {
                formatElement.setAttribute('max', maxSol);
                error = solError;
            }
        }
        document.querySelector('#numberOrDate + .invalid-feedback').textContent = error;
    }
    /**
     * handle the date type selection if it is date make date input
     * if it is sol make number input and add suitable attribute
     * @param formatElement - the input id to change according to the chosen type
     * @param val - the chosen type
     */
    const handleDateFormatSelection = function(formatElement, val) {
        const labelElement = document.querySelector('label[for="numberOrDate"]');
        let error = '';
        if (val === "1") {
            labelElement.textContent = 'Date:';
            formatElement.setAttribute('type', 'date');
            formatElement.setAttribute('max', maxDate);
            if (minDate !== '-') {
                formatElement.setAttribute('min', minDate);
            }
            error = dateError;
        } else if (val === "2") {
            labelElement.textContent = 'SOL:';
            formatElement.setAttribute('type', 'number');
            formatElement.setAttribute('min', '0');
            if (maxSol !== '-') {
                formatElement.setAttribute('max', maxSol);
            }
            error = solError;
        }
        document.querySelector('#numberOrDate + .invalid-feedback').textContent = error;
    };

    return {
        handleRoverSelection: selection,
        handleDateFormatSelection: handleDateFormatSelection
    }
})();

/**
 * handle submit button check input show error messages
 * show spinner send API request show result
 * @type {{handleSubmit: handleSubmit}}
 */
const submit =
    (function () {
        /**
         * check the input show error message when invalid
         * @param event - click on submit button
         * @returns {isValid} - boolean if the input is valid or ot
         */
        let submitClicked = true;
        function checkInput(event) {
            const form = document.querySelector('.needs-validation');
            event.preventDefault();
            event.stopPropagation();
            let isValid = form.checkValidity();
            form.classList.add('was-validated');
            spinner.remove();
            return isValid;
        }
        /**
         * get the API url to fetch according to the data
         * @param date - date data could be data or number according to data type
         * @param dateType - sol or earth date
         * @param rover - rover type
         * @param cameVal - camera type
         * @returns {string} - the url to fetch
         */
        function getURl(date, dateType, rover, cameVal) {
            let urlDate = (dateType === '1') ? '&earth_date=' : '&sol=';
            urlDate += date;
            let camera = (cameVal !== '-1') ? ('&camera=' + cameVal) : '';
            let url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${handleAPI.roverData(rover).name}/photos?api_key=${KEY_API}`;
            return url + urlDate + camera;
        }
        /**
         * handle submit button show the spinner check if the input is valid
         * get the data and send url according to the data and sent the API request
         * @param event - click on submit button
         * @param date - the data value or sol number
         * @param dateType - date type sol or earth date
         */
        const handleSubmit = function(event, date, dateType) {
            spinner.show();
            document.getElementById("result").innerHTML = '';
            if (checkInput(event)) {
                spinner.show();
                let urlAPI = getURl(date, dateType,
                    document.querySelector("#rovers").value,
                    document.querySelector("#cameras").value);
                handleAPI.getCards(urlAPI);
            }
        };
        return { handleSubmit: handleSubmit }
    })();
/**
 * handle the save button on the card
 * @type {{removeIdFromList: removeId, handleSaveButton: saveButton, savedData: (function(): *[])}}
 */
const savePicture =
    (function () {
        let saved_list = [];
        /**
         * handle the save button if image is already in the data structure
         * will show the modal else will add it to the data structure
         * @param listItems - all the data about the image (rover, data, sol, ...)
         * @param imageSrc - string of url of the chosen image
         */
        function addPicToList(listItems, imageSrc) {
            newSave = {'img_src': imageSrc,};
            listItems.forEach((item, index) => {
                if (index < 4) {
                    newSave[`item${index}`] = item.innerText;
                }
            });
            let isSaved = saved_list.some(item => item.item0 === newSave.item0);
            if (!isSaved) {
                saved_list.push(newSave);
                const toastBootstrap = new bootstrap.Toast(document.getElementById('liveToast'));
                toastBootstrap.show();
            } else {
                showModal("Already In List!", "You cannot save the same image twice !");
            }
            newSave = [];
        }
        /**
         * add the chosen image to the data structure
         * @param event - the click on the save button of the image
         */
        const saveButton = function(event) {
            if (event.target.classList.contains('toast-btn')) {
                const card = event.target.closest('.card');
                if (card) {
                    addPicToList(card.querySelectorAll('.list-group-item'),
                                    card.querySelector('.card-img-top').src);
                }
            }
        };
        /**
         * delete the id from the dictionary
         * @param id
         */
        const removeId = function(id) {
            saved_list = saved_list.filter(dict => parseInt(dict.item0) !== id);
        };
        /**
         * return the data structure
         * @returns {*[]}
         */
        const savedData = function() {
            return saved_list;
        };

        return { handleSaveButton: saveButton,
            removeIdFromList: removeId,
            savedData: savedData
        }
    })();
/**
 * handle the saved images button show the data
 * @type {{setInSaved: setInSaved, inSavedList: boolean, saveListHTML: saveListHTML, handleSavedImages: savedImages}}
 */
const savedList =
    (function () {
        let InSaved = false;
        /**
         * add HTML data to index file according to saved list array
         */
        function saveListHTML() {
            const listElement =  document.getElementById('savedList');
            const CarouselElement =  document.querySelector('.carousel-inner');

            savePicture.savedData().forEach(pic => {
                let ima = HTMLSyntax.carousel(pic.img_src, pic.item1, pic.item3, pic.item2);
                let list = HTMLSyntax.list(pic.item1, pic.item3, pic.item2, pic.item0);
                listElement.insertAdjacentHTML('beforeend', list);
                CarouselElement.insertAdjacentHTML('beforeend', ima);
            });

            const firstChild =  CarouselElement.querySelector(':first-child');
            if (firstChild)
                firstChild.classList.add('active');
        }
        /**
         * handle the click on saved images button hide home show saved page
         * show the list and the carousel
         */
        const savedImages = function() {
            document.getElementById("home").classList.add('d-none');
            document.getElementById("savedImages").classList.remove("d-none");
            if (!InSaved){
                saveListHTML();
                InSaved = true;
            }
        };
        /**
         * set insave to false or true
         * @param setSave
         */
        const setInSaved = function(setSave) {
            InSaved = setSave;
        };
        return {
            handleSavedImages: savedImages,
            saveListHTML: saveListHTML,
            inSavedList: InSaved,
            setInSaved: setInSaved
        }
    })();
/**
 * handle yhe onclick function in the html file
 * @type {{stop: stopCarousel, goHome: goHome, deleteItem: deletePic, start: startCarousel, clear: clearSearch}}
 */
const onClickFunctions = (function () {
    /**
     * show carousel
     */
        const startCarousel  = function() {
           document.getElementById("carousel").classList.remove('d-none');
        }
    /**
     * hide carousel
     */
        const stopCarousel = function() {
            document.getElementById("carousel").classList.add('d-none');
        }
    /**
     * delete id from data structure clear page then show the new page
     */
        function deletePic(id) {
            savePicture.removeIdFromList(id);
            document.getElementById("savedList").innerHTML = '';
            document.querySelector('.carousel-inner').innerHTML = '';
            savedList.saveListHTML();
        }
        /**
         * go to home page 
         */
        function goHome() {
            document.getElementById("home").classList.remove('d-none');
            document.getElementById("savedImages").classList.add("d-none");
            document.getElementById("carousel").classList.add('d-none');
            document.getElementById("savedList").innerHTML = '';
            document.querySelector('.carousel-inner').innerHTML = '';
            savedList.setInSaved(false);
        }
        /**
         * clear search result and remove errors
         */
        const clearSearch = function() {
            document.getElementById("result").innerHTML = '';
            const form = document.querySelectorAll('.needs-validation')[0];
            form.classList.remove('was-validated');
            spinner.remove();
        }
        return {
            start: startCarousel,
            stop: stopCarousel,
            clear: clearSearch,
            goHome: goHome,
            deleteItem : deletePic
        }
    })();

document.addEventListener('DOMContentLoaded', function () {
    
    const formatElement = document.querySelector("#numberOrDate");
    const dateElement = document.querySelector("#dates");

    readData();
    
    document.getElementById("dates").addEventListener("change", function () {
        roverSelection.handleDateFormatSelection(formatElement, this.value);
    });

    document.getElementById("rovers").addEventListener("change", function () {
        roverSelection.handleRoverSelection(this.value);
    });

    document.getElementById("submit").addEventListener("click", function (event) {
        submit.handleSubmit(event, formatElement.value, dateElement.value);
    });

    document.getElementById('result').addEventListener('click', function (event) {
        savePicture.handleSaveButton(event);
    });

    document.getElementById('saved').addEventListener('click', function () {
        savedList.handleSavedImages();
    });

}, false);