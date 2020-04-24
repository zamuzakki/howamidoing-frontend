const apikey = '85c36847b0824547b09be916bb261e75';
const main = document.querySelector('#main');

const wellStatus = document.querySelector('#well');
const suppliesStatus = document.querySelector('#supplies');
const medicalStatus  = document.querySelector('#medical');

var reportStatus;

window.addEventListener('load', async e => {

    wellStatus.addEventListener('click', e => {
        console.log("well statusClicked");
        statusClicked('healthy');

    });

    suppliesStatus.addEventListener('click', e => {
        statusClicked('supplies');

    });

    medicalStatus.addEventListener('click', e => {
        statusClicked('medical');

    });

});

async function statusClicked(status) {

    reportStatus = status;
    const view = `
    <div class="container">
            <div class="row" id="main">
                <div class="col-sm-12">
                    <div class="tr-section">
                         <div class="post-content">
                            <p tabindex="0">Status updated</p>
                        </div>
                    </div>
                </div>
                <div class="col-sm-12">
                    <div class="tr-section">
                        <a id="viewmap" class="btn btn-lg btn-secondary col-sm-12" href="#" role="button">View Map</a>
                    </div>
                </div>
                <div class="col-sm-12">
                    <div class="tr-section">
                         <div class="post-content">
                            <p tabindex="0">Status has been updated click above </p>
                        </div>
                    </div>
                </div>
            </div>
            <!-- /.row -->
        </div>`


    // const viewMap = document.querySelector('#viewmap');
    // viewMap.addEventListener('click', e => {
    //     map();

    // });

    main.innerHTML = view;

}

async function map() {

    const view = `
    <div class="container">
            <div class="row" id="main">
             <div id="map">
             </div>
            </div>
            <!-- /.row -->
        </div>`


    // const sendReport = document.querySelector('#report');

    // sendReport.addEventListener('click', e => {
    //     report();

    // });

    main.innerHTML = view;

}

async function report(status) {
    const user = "uuid"

    const res = await fetch(`https://locahost/v1/?source=${source}&apikey=${apikey}`);
    const json = await res.json();

    main.innerHTML = json.articles.map(createArticle).join("\n");
}

$(document).ready(function() {
    /*============================================
    Scroll To Top
    ==============================================*/

    //When distance from top = 250px fade button in/out
    $(window).scroll(function() {
        if ($(this).scrollTop() > 250) {
            $('#scrollup').fadeIn(300);
        } else {
            $('#scrollup').fadeOut(300);
        }
    });

    //On click scroll to top of page t = 1000ms
    $('#scrollup').click(function() {
        $("html, body").animate({ scrollTop: 0 }, 1000);
        return false;
    });

});