/*global webshim $ wl MobileDetect*/

var app = {

    preInit: function () {

        // form polyfill
        (function () {
            webshim.setOptions('forms', {
                lazyCustomMessages: true,
                replaceValidationUI: true
            });
            webshim.polyfill('forms');
        })();
    },

    init: function () {

        var HTML_EL = document.documentElement;
        var BODY = document.body;
        var FORMS = document.querySelectorAll("form");

        var THANKS_LOCATION = "thanks.html";
        var name;

        // form phone input handler
        $("input[name=phone]").inputmask({
            "mask": "+9(999)999-9999",
            greedy: false,
            clearIncomplete: true,
            "oncomplete": function () {
                $(this).addClass("input_success");
            },
            onKeyDown: function (event, buffer) {

                if (buffer[buffer.length - 1] === "_") {
                    $(this).removeClass("input_success");
                } else {
                    $(this).addClass("input_success");
                }
            }
        });

        // gallery
        $(".js-sec3-gallery").slick({
            //arrows: false,
            prevArrow: ".js-sec3-gallery-arrow-left",
            nextArrow: ".js-sec3-gallery-arrow-right"
        });

        // open form on PC or open app on mobile
        (function setPhoneLinkAction() {
            var md = new MobileDetect(window.navigator.userAgent);
            var phoneLink = document.querySelectorAll('[data-phone]');
            var phoneData = phoneLink[0].getAttribute("data-phone");

            if (phoneLink) {

                if (md.mobile()) {

                    for (var i = 0; i < phoneLink.length; i++) {
                        phoneLink[i].setAttribute("href", "tel:" + phoneData);
                        phoneLink[i].classList.remove("js-small-btn");
                    }
                } else {

                    for (var j = 0; j < phoneLink.length; j++) {
                        phoneLink[j].setAttribute("href", "");
                        phoneLink[j].classList.add("js-small-btn");
                    }
                }
            }
        })();

        // close form on click close-btn and background
        (function hideForm() {

            BODY.addEventListener("click", function (e) {
                targetClickHandler(e, ["form-wrap", "form__close"]);
            });

            function targetClickHandler(event, classes) {
                var el = event.target;
                var elCls = el.classList;

                for (var i = 0; i < classes.length; i++) {
                    var curClass = classes[i];

                    if (elCls.contains(curClass)) {
                        formAction().closeAllForms();
                    }
                }
            }
        })();

        // create input with name = title for phpMail handler
        (function setInputTitle() {
            var titleVal = document.querySelector("title").innerText;
            var forms = document.querySelectorAll("form");
            var inputTitles;

            for (var i = 0; i < forms.length; i++) {
                var form = forms[i];
                var formInput = createInputEl();
                form.insertBefore(formInput, form.firstElementChild);
            }

            inputTitles = document.querySelectorAll(".js-hidden-title");

            for (var j = 0; j < inputTitles.length; j++) {
                var input = inputTitles[j];
                input.value = titleVal;
            }

            function createInputEl() {
                var input = document.createElement("input");
                input.classList.add("js-hidden-title");
                input.name = "title";
                input.type = "hidden";

                return input;
            }
        })();

        if (typeof wl != "undefined") {

            wl.callbacks.onFormSubmit = function ($form, res) {
                if ($form.data('next')) {

                    if (res.status == 200) {
                        smallFormHandler($form);
                    } else {
                        wl.callbacks.def.onFormSubmit($form, res);
                    }
                } else {
                    bigFormHandler($form);
                }
            };
        } else {

            formsHandler();
        }

        // function formsHandler(options) {
        //     var firstForms = options.firstForms;
        //     var secondForm = options.secondForms;
        //     var openFormBtn = options.openFormBtn;

        //     openFormBtn.addEventListener("click", function() {

        //     });

        //     function openSmallForm() {

        //     }
        // }

        function formsHandler() {

            for (var i = 0; i < FORMS.length; i++) {
                var form = FORMS[i];

                if (form.hasAttribute("data-next")) {

                    form.addEventListener("submit", function (e) {
                        e.preventDefault();

                        smallFormHandler($(form));
                    });
                } else {
                    form.addEventListener("submit", function (e) {
                        e.preventDefault();

                        bigFormHandler($(form));
                    });
                }
            }
        }

        function setInputValues() {
            var userInfo;

            if (localStorage.getItem("landUserInfo")) {
                userInfo = JSON.parse(localStorage.getItem("landUserInfo"));
            }

            document.querySelector('[name=name1]').value = userInfo.name;
            document.querySelector('[name=phone1]').value = userInfo.phone;
            document.querySelector('[name=email1]').value = userInfo.email;

            if (userInfo.city !== "" && userInfo.city) {
                document.querySelector('[name=city]').value = userInfo.city;
            }
        }

        function smallFormHandler(form) {

            var selfName = form.find("input[name=name]");
            var selfPhone = form.find("input[name=phone]");
            var selfEmail = form.find("input[name=email]");
            var selfCity = form.find("input[name=city]");

            // var selfName = form.querySelector("input[name=name]");
            // var selfPhone = form.querySelector("input[name=phone]");
            // var selfEmail = form.querySelector("input[name=email]");
            // var selfCity = form.querySelector("input[name=city]");

            var formData = form.serialize();

            var landUserInfo = {
                "name": selfName.val(),
                "phone": selfPhone.val(),
                "email": selfEmail.val(),
                "city": selfCity.val()
            };

            localStorage.setItem("landUserInfo", JSON.stringify(landUserInfo));

            name = selfName.val();

            $.ajax({
                type: "POST",
                url: "php/send.php",
                data: formData,
                success: function () {
                    window.location = THANKS_LOCATION;
                }
            });

            if (name) {
                localStorage.setItem("landclientname", name + ", наши");
            } else {
                localStorage.setItem("landclientname", "Наши");
            }
        }

        function bigFormHandler(form) {
            var formData;
            formData = form.serialize();

            $.ajax({
                type: "POST",
                url: "php/sendpresent.php",
                data: formData,
                success: function () {
                    formAction().closeBigForm();
                }
            });
        }

        function formAction() {
            var smallFormWrap = document.querySelector(".form-wrap_small");
            var bigFormWrap = document.querySelector(".form-wrap_big");
            var formsWrap = document.querySelectorAll(".form-wrap");

            return {

                openSmallForm: function () {
                    HTML_EL.classList.add("form-open");
                    smallFormWrap.classList.add("form-wrap_open");
                },

                openBigForm: function (callback) {
                    HTML_EL.classList.add("form-open");
                    bigFormWrap.classList.add("form-wrap_open");

                    callback();
                },

                closeSmallForm: function () {
                    HTML_EL.classList.remove("form-open");
                    smallFormWrap.classList.remove("form-wrap_open");
                },

                closeBigForm: function () {
                    HTML_EL.classList.remove("form-open");
                    bigFormWrap.classList.remove("form-wrap_open");
                },

                closeAllForms: function () {
                    HTML_EL.classList.remove("form-open");

                    for (var i = 0; i < formsWrap.length; i++) {
                        var form = formsWrap[i];
                        form.classList.remove("form-wrap_open");
                    }
                }
            };
        }

        // actions on page thanks.html
        (function thanksPageHandler() {

            if (isThanksPage()) {
                formAction().openBigForm(setInputValues);
                setUserName();
            } else {
                showSmallForm();
            }

            function isThanksPage() {

                if (document.querySelector(".thanks")) {
                    return true;
                } else {
                    return false;
                }
            }
        })();

        // show small form
        function showSmallForm() {
            var smallBtns = document.querySelectorAll(".js-small-btn");

            var smallBtnClick = function (e) {
                e.preventDefault();

                formAction().openSmallForm();
            };

            if (smallBtns) {

                for (var i = 0; i < smallBtns.length; i++) {
                    var smallBtn = smallBtns[i];

                    smallBtn.addEventListener("click", smallBtnClick);
                }
            }
        }

        function setUserName() {
            $("#thanksName").text(localStorage.getItem("landclientname"));
        }
    },

    imgLoad: function () {

        (function () {
            if (document.documentElement.classList.contains("preloader-show")) {
                document.documentElement.classList.remove("preloader-show");
            }
        })();

        // animations
        (function () {
            animate(".sec1__curtain-top", "sec1__curtain-top_before-ready");
            animate(".sec1__clouds", "sec1__clouds_before-ready");
            animate(".sec1__curtain-side", "sec1__curtain-side_before-ready");

            checkViewport(".sec7__cloud_1", function () {
                animate(".sec7__cloud_1", "sec7__cloud_before-ready", 0);
            });

            checkViewport(".sec7__cloud_2", function () {
                animate(".sec7__cloud_2", "sec7__cloud_before-ready", 0);
            });

            function animate(elem, removeClass, dur) {
                var elemDOM = document.querySelectorAll(elem);
                var duration = dur || 500;

                if (elemDOM) {

                    setTimeout(function () {

                        for (var i = 0; i < elemDOM.length; i++) {
                            var elem = elemDOM[i];
                            elem.classList.remove(removeClass);
                        }
                    }, duration);
                }
            }

            function checkViewport(elem, callback) {
                var screenHeight = document.documentElement.clientHeight;
                var el = document.querySelector(elem);
                var elBounding;
                var elBottom;
                //var elTop;

                window.addEventListener("scroll", function () {
                    // console.log("screenHeight: " + screenHeight);
                    // console.log("elTop: " + elTop);
                    // console.log("elBottom: " + elBottom);
                    compareSizes();
                });

                compareSizes();

                function compareSizes() {
                    elBounding = el.getBoundingClientRect();
                    elBottom = elBounding.bottom;
                    //elTop = elBounding.top;

                    if (elBottom <= screenHeight) {
                        callback();
                    }
                }
            }
        })();
    }
};

app.preInit();
document.addEventListener("DOMContentLoaded", app.init);
window.addEventListener("load", app.imgLoad);
//# sourceMappingURL=app.js.map
