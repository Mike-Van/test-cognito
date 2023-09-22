#Getting Started

First and formost run:
	yarn install

We mainly use it for routing, pwa and bundling. Thus the actual components resides in 'ui-component' package. 

## Build components

### ui-components
1. Go to maphub/packages/ui-component
2. Run:
	yarn start

## Start map-hub with PWA disabled
1. Go to maphub/packages/next-app
2. Run: 
	yarn start
3. View the map in browser with localhost:3000

## Start map-hub with PWA enabled (Production mode)
1. Go to maphub/packages/next-app
2. Run: 
	yarn deploy
3. View the map in browser with localhost:3000
### Testing next-app PWA feature
#### Offline mode
1. Setting browser into offline mode
2. Refesh the map, then you should be able to interact with the map as it is online
#### Installable for Ubuntu
1. Install android studio
	https://developer.chrome.com/docs/devtools/remote-debugging/	
3. Click on 'Port forwading', in 'Port' enter "3000" and 'Ip address and port' enter 'localhost:3000'
4. Go to android studio and run and android emulator 
5. Start android browser and enter 'localhost:3000'
6. You should see the map loaded and installable status at the bottom of the screen

# Next App

## Single Responsbility Principle

MapStack will follow the single responsibility principle for all areas of development. This will allow our system scale, be easy to maintain and more straight forward to test and debug.

Next has two responsibilities in our system:

	1. To be a URL router
	2. To render our compoile/render our React apps

The next app should only contain routing logic and rendering logic, it should not contain business logic.

### Routing

The first role of Next for our monorepo is to requests to URLs and route them to the correct React app. This allows us to have separate apps (packages) for each part of application (e.g. map viewer, user settings, billing etc). 

Each package can then have its own single responsibility, this provides the following benefits:

	1. Avoids creating a monolyth application 
	2. Each package can be coded and tested in isolation
	3. Unit tests are fast to run for each package
	4. Avoids tight coupling to other packages
	5. Packages can easily be replaced or upgraded in the future

Examples:

	- mapstack.com/billing -> packages/billing
	- mapstack.com/maps/{id} -> packages/map-viewer


## rendering

Rendering ensures that each page the end user loads only contains the code required for that page and that the HTML has already been created. This will ensure that our app is fast and can meet the performance expectations of a PWA (Progressive Web App).
