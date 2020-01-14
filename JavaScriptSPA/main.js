var msalConfig = {
    auth: {
        clientId: "7d41fe43-bfea-43ec-a638-1bd39cc355ab",
        authority: "https://login.microsoftonline.com/common",
        redirectURI: "http://localhost:30662/"
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: true
    }
};

var events = {};

    var graphConfig = {
        soon: Date.now()+7200,
        graphMeEndpoint: "https://graph.microsoft.com/v1.0/me/calendarview?startdatetime=2020-01-20T08:30:00.001Z&enddatetime=2020-01-24T16:30:00.001Z&$select=subject,bodyPreview,start,end,location"
    };

    // create a request object for login or token request calls
    // In scenarios with incremental consent, the request object can be further customized
    var requestObj = {
        scopes: ["user.read", "Calendars.read"]
    };

    var myMSALObj = new Msal.UserAgentApplication(msalConfig);

    // Register Callbacks for redirect flow
    // myMSALObj.handleRedirectCallbacks(acquireTokenRedirectCallBack, acquireTokenErrorRedirectCallBack);
    myMSALObj.handleRedirectCallback(authRedirectCallBack);

    function signIn() {
        myMSALObj.loginRedirect(requestObj).then(function (loginResponse) {
            //Successful login
            showWelcomeMessage();
            //Call MS Graph using the token in the response
            acquireTokenRedirectAndCallMSGraph();
        }).catch(function (error) {
            //Please check the console for errors
            console.log(error);
        });
    }

    function signOut() {
        myMSALObj.logout();
    }

    function acquireTokenRedirectAndCallMSGraph() {
        //Always start with acquireTokenSilent to obtain a token in the signed in user from cache
        myMSALObj.acquireTokenSilent(requestObj).then(function (tokenResponse) {
            callMSGraph(graphConfig.graphMeEndpoint, tokenResponse.accessToken, graphAPICallback);
        }).catch(function (error) {
            console.log(error);
            // Upon acquireTokenSilent failure (due to consent or interaction or login required ONLY)
            // Call acquireTokenPopup(popup window) 
            if (requiresInteraction(error.errorCode)) {
                myMSALObj.acquireTokenRedirect(requestObj).then(function (tokenResponse) {
                    callMSGraph(graphConfig.graphMeEndpoint, tokenResponse.accessToken, graphAPICallback);
                }).catch(function (error) {
                    console.log(error);
                });
            }
        });
    }

    function callMSGraph(theUrl, accessToken, callback) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200)
                var data = JSON.parse(this.responseText);
                callback(data);
                events = data.value;
                schedule(events);
        }
        xmlHttp.open("GET", theUrl, true); // true for asynchronous
        xmlHttp.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        xmlHttp.send();
    }

    function schedule(events) {
        console.log("Scheduling")
        console.log(events)
        events.forEach(element => {
            var day
            switch(element.start.dateTime.split("-")[2].split("T")[0]){
                case "20": //M
                    day = "1";
                    break;
                case "21": //T
                    day = "2";
                    break;
                case "22": //W
                    day = "3";
                    break;
                case "23": //T
                    day = "4";
                    break;
                case "24": //F
                    day = "5";
                    break;
            };
            var sTime = element.start.dateTime.split(":");
            var eTime = element.end.dateTime.split(":");
            var subject
            switch (element.subject) {
                case "YR12 Team Meeting/PPD":
                    subject = "Tutor";
                case "L3 NQF BTEC Extended Diploma In Computing":
                    subject = "Triple Computing";
                default:
                    subject = element.subject;
            };
            var data = {
                "start": element.start.dateTime,
                "startcron": sTime[1] + " " + sTime[0].split("T")[1] + " * * " + day,
                "end": element.end.dateTime,
                "endcron": eTime[1] + " " + eTime[0].split("T")[1] + " * * " + day,
                "location": element.location.displayName.split(" - ")[0],
                "subject": subject
            };
            const Http = new XMLHttpRequest();
            const url='http://localhost:9999';
            Http.open("POST", url, true);
            Http.send(JSON.stringify(data));

            Http.onreadystatechange = (e) => {
            console.log(Http.responseText)
            }
            console.log(data);
        });
    }

    function graphAPICallback(data) {
        document.getElementById("json").innerHTML = JSON.stringify(data, null, 2);
    }

    function showWelcomeMessage() {
        var divWelcome = document.getElementById('WelcomeMessage');
        divWelcome.innerHTML = "Welcome " + myMSALObj.getAccount().userName + " to Microsoft Graph API";
        var loginbutton = document.getElementById('SignIn');
        loginbutton.innerHTML = 'Sign Out';
        loginbutton.setAttribute('onclick', 'signOut();');
    }

   //This function can be removed if you do not need to support IE
   function acquireTokenRedirectAndCallMSGraph() {
        //Always start with acquireTokenSilent to obtain a token in the signed in user from cache
        myMSALObj.acquireTokenSilent(requestObj).then(function (tokenResponse) {
            callMSGraph(graphConfig.graphMeEndpoint, tokenResponse.accessToken, graphAPICallback);
        }).catch(function (error) {
            console.log(error);
            // Upon acquireTokenSilent failure (due to consent or interaction or login required ONLY)
            // Call acquireTokenRedirect
            if (requiresInteraction(error.errorCode)) {
                myMSALObj.acquireTokenRedirect(requestObj);
            }
        });
    }

    function authRedirectCallBack(error, response) {
        if (error) {
            console.log(error);
        } else {
            if (response.tokenType === "access_token") {
                callMSGraph(graphConfig.graphMeEndpoint, response.accessToken, graphAPICallback);
            } else {
                console.log("token type is:" + response.tokenType);
            }
        }
    }

    function requiresInteraction(errorCode) {
        if (!errorCode || !errorCode.length) {
            return false;
        }
        return errorCode === "consent_required" ||
            errorCode === "interaction_required" ||
            errorCode === "login_required";
    }

    // Browser check variables
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE ');
    var msie11 = ua.indexOf('Trident/');
    var msedge = ua.indexOf('Edge/');
    var isIE = msie > 0 || msie11 > 0;
    var isEdge = msedge > 0;

    //If you support IE, our recommendation is that you sign-in using Redirect APIs
    //If you as a developer are testing using Edge InPrivate mode, please add "isEdge" to the if check

    // can change this to default an experience outside browser use
    var loginType = "REDIRECT";

    // runs on page load, change config to try different login types to see what is best for your application
    if (loginType === 'POPUP') {
        if (myMSALObj.getAccount()) {// avoid duplicate code execution on page load in case of iframe and popup window.
            showWelcomeMessage();
            acquireTokenPopupAndCallMSGraph();
        }
    }
    else if (loginType === 'REDIRECT') {
        document.getElementById("SignIn").onclick = function () {
            myMSALObj.loginRedirect(requestObj);
        };

        if (myMSALObj.getAccount() && !myMSALObj.isCallback(window.location.hash)) {// avoid duplicate code execution on page load in case of iframe and popup window.
            showWelcomeMessage();
            acquireTokenRedirectAndCallMSGraph();
        }
    } else {
        console.error('Please set a valid login type');
    }