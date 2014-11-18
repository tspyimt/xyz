#ArtLock Application
<hr/>

###Technology Stack

* Node.js
* Angular.js
* MongoDB
* Mongoose
* Express.js
* Ffmpeg
* Phantom js

---

####Pushing code to github:

* Main branch with the most updated and stable code will be `master` branch.
* Each new feature should be started in a new a branch and pull requests should be created whenever the feature is completed. New branch can be created using  `git checkout -b 'ISSUE_321_USER_LOGIN'`.
* Make sure to take pull from `develop` branch and rule out any conflicts before creating pull requests.
* Branch name should start with `ISSUE_#NO_SOME_TEXT_RELATED_TO_FEATURE` like shown above.
<hr/>

###Build Instructions

####Grunt
Grunt will be used as the build tool for automating all the tasks related to the application. `Don't commit the built files to git`.

####Bower
Bower will be used as the front end package management tool. `Don't commit the bower files to git`

<hr/>

Last Updated On: 10th June 2014


#APP INFO

###Structure Of The App###
Here we try to explain the various directories and the structure of the application.

We have tried to structure the application in the way that we get minimum overhead of supporting code, and the implementation is clean and organized.

Application is broken down into Controllers(Handles HTTP requests), Services(All Business logic) and Domains(Database ODM).

The structure of the app is as follows:
> * **artLock**
  * **conf**
    * **AppConfig.json** //This file contains the App core config for various environments.
    * **Config.json** //This file contains the App custom config for various environments.
    * **Bootstrap.js** //This file runs once when app starts and loads.
    * **URLMappings.js** //We do URL Mappings in this file.
  * **controllers** //this dir contains all controllers.
    * **TestController.js** //A sample controller.
  * **custom_modules** //All custom modules goes here
    * **AppBuilder** //This module contains some helper methods to define the base structure of app.
  * **domain** //Contains the Domain Object descriptors.
    * **Test.js** //A sample Domain.
  * **hooks** //Contains hooks for listening global events like onGeneratePDF.
        * **onGeneratePDF.js** //A sample hook.
  * **jobs** //Contains jobs for executing some project level tasks an triggering them on regular basis.
          * **sampleJob.js** //A sample job.
  * **services** //All services goes here.
    * **TestService.js** //A Sample Service.
  * **tests** //Test cases goes here.
    * **integration** //We write the integration tests here.
  * **web-app** //Contains static and frontend views.
    * **css**
    * **font**
    * **img**
    * **js**
    * **partials** // Contains angular partial views
    * **views** // contain static ejs files
      * **mailTemplates** // Contain all email templates
      * **user**

###Custom Globals Available in app###
* **__appBaseDir**: This contains the base directory of the application.
* **_config**: This contains the config that is provided in the AppConfig and Config.json files. The config of right environment is loaded here.
* **log**: This is teh global object for logger. Following are the ways we can log in the project:
  * **log.trace(String/Object[,...])**: For trace level logs. This is fifth highest priority log.
  * **log.debug(String/Object[,...])**: For debug level logs. This is fourth highest priority log.
  * **log.info(String/Object[,...])**: For info level logs. This is third highest priority log.
  * **log.warn(String/Object[,...])**: For warn level logs. This is second highest priority log.
  * **log.error(String/Object[,...])**: For error level logs. This is highest priority log.
* **__appEnv**: This contains the current app environment.
* **_app**: This contains the express app object getter.
* **Various Domains**: You can access the domains with the name of it globally. These are not objects, just the getters to keep the global object light.
* **Various Services**: You can access the services with the name of it globally. These are not objects, just the getters to keep the global object light.

###Environment Variables Listened###
Following environment variables are considered by the app.
* **NODE_ENV**: It defines the environment the app should run in. If not specified then the default is the "development". See AppConfig.json for options in environments. You can add as many environments as you like.
* **PORT**: If the app is to be run on special port. If it si specified then it overrides the settings in AppConfig.json.

###Special API Methods In Response###
There are few helper methods injected in response to keep the code DRY and to avoid repetitive work. Also these provide a central point of control for the API.
The methods are as follows:
* **res.sendErrorAPIResponse(message, status, headers)**: Used to send the error response back to user. headers is optional, if no status is supplied then 200 is considered.
* **res.sendSuccessAPIResponse(data, status, headers)**: Used to send a success response. headers is optional, if no status is supplied then 200 is considered.


###Deployment steps###

Step1: Login on server.
Step2: run command: `cd artplus`
Step3: run command: `./deploy-main.sh`


####Change deployment branch####

Edit `.prodSettings` file in `/artplus` directory on the server.

