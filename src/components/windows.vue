<template>
    <div class="windows">
        <server-stats />

            <hsc-window-style-theoldnet  v-for="app in apps" :key="app.title">
                <hsc-window 
                    :title="app.title" 
                    :resizable="true" 
                    :minWidth="app.minWidth"
                    :minHeight="app.minHeight"
                    :isScrollable="false"
                    :closeButton="false" 
                    :isOpen="app.state.isOpen"
                    :activateWhenOpen="true"
                    :xpositionHint="app.positionHint"
                    :width="app.width" 
                    :height="app.height" 
                    :top="app.top"
                    :left="app.left"
                    v-on:closebuttonclick="closeButton(app)"
                    v-on:activate="setActive(app)"
                    :ref="app.title"
                    v-if="app.state.isRunning"
                    @click="setBlockPointerEvents(false)"
                    @resize-start="setBlockPointerEvents(true)" 
                    @resize-end="wasResized(app)" 
                    @move-start="setBlockPointerEvents(true)" 
                    @move-end="wasMoved(app)"
                    class="window"
                >

                    <template slot="title">
                        <div class="title-bar">
                            <div class="title-bar-text">
                                <span class="title-icons">
                                    <img :src="app.icon" class="icon-title"> {{app.title}}
                                </span>
                                
                            </div>
                            <div class="title-bar-controls">
                                <button aria-label="Minimize" @click="toggleMinimize(app)"></button>
                                <button aria-label="Maximize" @click="toggleMaximize(app)"></button>
                                <button aria-label="Close" @click="closeButton(app)"></button>
                            </div>
                        </div>
                    </template>

                    <!-- <div class="window-body"> -->
                        <div @click="setBlockPointerEvents(false)" class="iframe-wrapper">
                            <iframe 
                                :src="app.url" 
                                class="iframe" 
                                :ref="app.title + 'iframe'" 
                                :scrolling="app.scrolling" 
                                v-on:mouseleave="mouseLeaveHandler"
                                :class="{ blockPointerEvents : blockPointerEvents }"
                            ></iframe>
                        </div>
                    <!-- </div> -->
<!-- 
                    <div class="status-bar">
                        <p class="status-bar-field">Press F1 for help</p>
                        <p class="status-bar-field">Slide 1</p>
                        <p class="status-bar-field">CPU Usage: 14%</p>
                    </div> -->

                </hsc-window>
            </hsc-window-style-theoldnet>
        
        <!-- <hsc-window-style-theoldnet v-for="app in apps" :key="app.title">
            <hsc-window 
                :title="app.title" 
                :resizable="true" 
                :minWidth="app.minWidth"
                :minHeight="app.minHeight"
                :isScrollable="false"
                :closeButton="false" 
                :isOpen="app.state.isOpen"
                :activateWhenOpen="true"
                :xpositionHint="app.positionHint"
                :width="app.width" 
                :height="app.height" 
                :top="app.top"
                :left="app.left"
                v-on:closebuttonclick="closeButton(app)"
                v-on:activate="setActive(app)"
                :ref="app.title"
                v-if="app.state.isRunning"
                @click="setBlockPointerEvents(false)"
                @resize-start="setBlockPointerEvents(true)" 
                @resize-end="wasResized(app)" 
                @move-start="setBlockPointerEvents(true)" 
                @move-end="wasMoved(app)"
            >

                <template slot="title">
                    <div v-on:mouseleave="mouseLeaveHandler" class="title-bar-theoldnet">
                        <span class="title-icons">
                            <img :src="app.icon" class="icon-title">
                        </span>
                        <span>{{app.title}}</span>
                        <span class="title-buttons">
                            <span class="title-button button-refresh" @click="refreshWindow(app)"><font-awesome-icon icon="redo-alt" /></span>
                            <span class="title-button button-minimize" @click="toggleMinimize(app)"><font-awesome-icon icon="window-minimize" /></span>
                            <span v-if="app.resizable" class="title-button button-maximize" @click="toggleMaximize(app)"><font-awesome-icon icon="window-maximize" /></span>
                            <span class="title-button button-close" @click="closeButton(app)"><font-awesome-icon icon="window-close" /></span>
                        </span>
                    </div>
                </template>

                <div @click="setBlockPointerEvents(false)" class="iframe-wrapper">
                    <iframe 
                        :src="app.url" 
                        class="iframe" 
                        :ref="app.title + 'iframe'" 
                        :scrolling="app.scrolling" 
                        v-on:mouseleave="mouseLeaveHandler"
                        :class="{ blockPointerEvents : blockPointerEvents }"
                    ></iframe>
                </div>

            </hsc-window>
        </hsc-window-style-theoldnet> -->

        <hsc-window-style-metal>
            <hsc-window title="Add New Application" :closeButton="true" :isOpen.sync="showAddApp">
                <add-new-app :apps="apps" @added="addApp"/>
            </hsc-window>
        </hsc-window-style-metal>

        <div class="taskbar-container">
            <div class="taskbar">
                <div v-for="app in apps" :key="app.title" :tooltip="app.title " class="task" @click="toggleOpen(app)">
                    <img :src="app.icon" alt="" class="icon" v-bind:class="{ 'task-active': app.state.isFocused , 'icon-running': app.state.isRunning, 'icon-minimized': app.state.isRunning && !app.state.isOpen}"/>
                    <!-- <span class="task-title" v-bind:class="{ 'bold': app.state.isRunning, 'minimized': app.state.isRunning && !app.state.isOpen}">{{app.title}}</span> -->
                </div>
                <div tooltip="New App" class="add">
                    <font-awesome-icon icon="plus" class="add-new-app" @click="showAddApp = !showAddApp"/>
                    <!-- <img :src="app.icon" alt="" class="icon" v-bind:class="{ 'task-active': app.state.isFocused , 'icon-running': app.state.isRunning, 'icon-minimized': app.state.isRunning && !app.state.isOpen}"/> -->
                    <!-- <span class="task-title" v-bind:class="{ 'bold': app.state.isRunning, 'minimized': app.state.isRunning && !app.state.isOpen}">{{app.title}}</span> -->
                </div>
            </div>
        </div>
    </div>
</template>


<style>

.windows{
    background: url('../assets/wallpaper.jpg') no-repeat center center fixed; 
    -webkit-background-size: cover;
    -moz-background-size: cover;
    -o-background-size: cover;
    background-size: cover;
    width: 100vw;
    height: 100vh;
    padding: 0;
    margin: 0;
}

body {
  user-select: none;
  background-color:darkgrey;
  /* background: url('../assets/wallpaper.jpg') no-repeat center center fixed;  */
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  overflow: hidden;
}


.add-new-app {
    color: rgba(255, 255, 255, 0.555);
    font-size: 2rem;
    padding: 0 12px;
}

.add-new-app:hover {
    color: white;
}

[tooltip]:before {            
    position : absolute;
     content : attr(tooltip);
     opacity : 0;
     border: 1px solid rgb(129, 129, 129);
     top: -40px;
     background: rgb(241, 241, 241);
     transition: all .2s ease-in-out;
     padding: 3px 10px;
     border-radius: 5px;
     white-space: nowrap;
}

[tooltip]:hover:before {        
    opacity : .9;
}

.iframe-wrapper {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
}

.icon {
    width: 38px;
    height: 38px;
    /* width: 48px;
    height: 48px; */
    /* border: 1px solid rgb(136, 136, 136); */
    border-radius: 1px;
    /* background: rgb(143, 143, 143); */
    padding: 2px;
    transition: all .2s ease-in-out;
    border-bottom: 3px solid rgba(31, 31, 31, 0);
}

.icon-running {
    border-bottom: 3px solid rgb(0, 204, 255);
    transition: all .2s ease-in-out;
}

.icon-minimized {
    opacity: .6;
}

.icon-title {
    width: 14px;
    height: 14px;
    padding: 0;
    margin: 0;
}

.titlebar {
    padding: .1rem;
}

.title-bar-theoldnet {
    display: flex;
    justify-content: space-between;
    width: 100%;
}

/* .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
} */

.title-icons {
    width: 100px;
    /* border: 1px solid red; */
    text-align: left;
    padding: 0;
    padding-left: 3px;
    margin: 0;
    display: flex;
    align-items: center;
}

.title-buttons {
    width: 100px;
    /* border: 1px solid red; */
    text-align: right;
    padding: 0;
    margin: 0;
}

.title-buttons:hover{
    cursor: pointer;
}

.title-button{
    margin: 0 3px;
    color:rgb(94, 94, 94);
}

.title-button:hover {
    cursor: pointer;
    color: rgb(122, 122, 122);
    transition: all .15s ease-in-out;
}

.taskbar-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
}

.taskbar{
    user-select: none;
    z-index: 999;
    position: absolute;
    /* border: 2px solid black; */
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
    bottom: 0;
    /* width: 50%; */
    /* background: linear-gradient(rgba(90, 90, 90, 0.568), rgba(41, 41, 41, 0.616)); */
    background: rgba(31, 31, 31, 0.637);
    /* background: url('../assets/wallpaper.jpg') no-repeat center center fixed;  */
    color:black;
    display: flex;
    text-align: left;
    flex-wrap: wrap;
    /* justify-content: center; */
}

.add {
    /* border-radius: 3px; */
    margin: 4px 4px;
    max-width: 150px;
    display: flex;
    align-items: center;
}

.add:hover{
    cursor: pointer;
}

.task {
    /* border: 1px solid rgb(138, 138, 138); */
    /* padding: 5px; */
    /* padding-right: 15px; */
    /* padding: 7px; */
    border-radius: 3px;
    margin: 7px 4px;
    /* padding: 3px; */
    max-width: 150px;
    /* background: linear-gradient(rgb(215, 215, 215), rgb(191, 191, 191)); */
    display: flex;
    align-items: center;
}

.task-active {
    background: linear-gradient(rgba(198, 212, 214, .6), rgba(143, 166, 179, .6));
}

.task-title{
    padding-left: 10px;
    white-space: nowrap; 
    overflow: hidden;
    text-overflow: ellipsis;
}

.task:hover{
    cursor: pointer;
    background: linear-gradient(rgba(88, 167, 241, .6), rgba(126, 190, 228, .6));
}

.content {
    content: "Loading...";
    display: block;
    position: relative;
    background: rgb(58, 58, 58)  url("../assets/loading2.gif") no-repeat;
    /* background: url("../assets/loading2.gif") no-repeat; */
    background-size: 64px 64px;
    background-position: center; 
    /* width: 64px;
    height: 64px; */
    float: left;
    margin: 0 0px 0 0;
    padding: 0;
}

iframe {
    /* width: 98%;
    height: 98%; */
    width: 100%;
    height: 100%;
    border: none !important;
}
.radial-gradient-1 {
  width: 100%;
  height: 100%;
  background-image: radial-gradient(
    ellipse farthest-corner at 45px 45px,
    #00ffff 0%,
    rgba(0, 0, 255, 0) 50%,
    #0000ff 95%
  );
}

.radial-gradient-2 {
  width: 100%;
  height: 100%;
  background-image: radial-gradient(
    farthest-corner at 45px 45px,
    #ff0000 0%,
    #0000ff 100%
  );
}

/* table {
  border-collapse: collapse;
} */

/* td {
  text-align: center;
  color: rgba(0, 0, 0, 0.25);
}

th {
  color: white;
  background-color: #000;
} */

/* .window {
    background:black !important;
} */

.bold {
    font-weight: bold;
}

.minimized {
    color:rgb(95, 95, 95);
}

@keyframes spinner {
  to {transform: rotate(360deg);}
}
 
.spinner:before {
  content: '';
  box-sizing: border-box;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin-top: -10px;
  margin-left: -10px;
  border-radius: 50%;
  border: 2px solid #ccc;
  border-top-color: #333;
  animation: spinner .6s linear infinite;
}

.blockPointerEvents {
  pointer-events: none;
  /* opacity: .75; */
  /* border: 4px solid red; */
}
</style>
<script>

import "98.css";

import * as _ from 'lodash'
import Stats from './stats.js'

import Vue from 'vue'

import * as iconSuperMarkupWorld from '../assets/icons/supermarkupworld.png'
import * as iconWindows from '../assets/icons/windows.png'
import * as iconDos from '../assets/icons/dos.png'
import * as iconBrowser from '../assets/icons/browser.png'
import * as iconFlexget from '../assets/icons/flexget.png'
import * as iconNotepad from '../assets/icons/notepad2.png'
import * as iconPaint from '../assets/icons/mspaint.png'
import * as iconGlances from '../assets/icons/glances.png'
import * as iconTransmission from '../assets/icons/transmission.png'
import * as iconCamera from '../assets/icons/camera5.png'
import * as iconMinecraft from '../assets/icons/minecraft.png'
import * as iconTheOldNet from '../assets/icons/theoldnet.png'
import * as iconPlex from '../assets/icons/plex.png'
import * as iconCommodore from '../assets/icons/commodore2.png'
import * as iconInfo from '../assets/icons/info.png'
import * as iconHDD from '../assets/icons/hdd2.png'
import * as iconDialup from '../assets/icons/dialup.png'

import addNewApp from './add-new-app'



export default {
    components: { addNewApp },
    data() {
        return {
            remoteConfig: undefined,
            showAddApp: false,
            appTemplate: {
                title: undefined,
                icon: undefined,
                url: undefined,
                width: 640,
                height: 480,
                minWidth: 200,
                minHeight: 200,
                top: 20,
                left: 20,
                positionHint: '20 / 20',
                resizable: true,
                state: this.defaultState(),
                scrolling: 'yes',
            },
            blockPointerEvents: true,
            appsHistory: [],
            apps: [
                {
                    title: 'System Info',
                    icon: iconInfo,
                    url: '#sysinfo',
                    width: 600,
                    height: 400,
                    minWidth: 400,
                    minHeight: 200,
                    top: 400,
                    left: 400,
                    positionHint: '20 / 20',
                    resizable: true,
                    state: this.defaultState(),
                    scrolling: 'yes',
                },
                {
                    title: 'The Old Net',
                    icon: iconTheOldNet,
                    url: 'https://theoldnet.com/browser',
                    width: 900,
                    height: 500,
                    minWidth: 100,
                    minHeight: 100,
                    maxWidth: 2000,
                    maxHeight: 2000,
                    top: 100,
                    left: 500,
                    positionHint: '800 / 600',
                    resizable: true,
                    state: this.defaultState(),
                    scrolling: 'yes',
                },
                {
                    title: 'Minecraft Map',
                    icon: iconMinecraft,
                    url: 'https://map.daggasoft.com',
                    width: 900,
                    height: 500,
                    minWidth: 100,
                    minHeight: 100,
                    maxWidth: 2000,
                    maxHeight: 2000,
                    top: 100,
                    left: 500,
                    positionHint: '800 / 600',
                    resizable: true,
                    state: this.defaultState(),
                    scrolling: 'yes',
                },
                {
                    title: 'C64',
                    icon: iconCommodore,
                    url: './apps/c64-emulator/',
                    width: 600,
                    height: 420,
                    minWidth: 400,
                    minHeight: 400,
                    maxWidth: 2000,
                    maxHeight: 2000,
                    top: 0,
                    left: 0,
                    positionHint: '-50 / 350',
                    resizable: true,
                    state: this.defaultState(),
                    scrolling: 'yes',
                },
                {
                    title: 'Paint',
                    icon: iconPaint,
                    url: 'https://jspaint.app/',
                    width: 800,
                    height: 500,
                    minWidth: 100,
                    minHeight: 100,
                    top: 0,
                    left: 0,
                    positionHint: '20 / 500',
                    resizable: true,
                    state: this.defaultState(),
                    scrolling: 'yes',
                },
                {
                    title: 'Notepad',
                    icon: iconNotepad,
                    url: '#notepad',
                    width: 600,
                    height: 500,
                    minWidth: 100,
                    minHeight: 100,
                    top: 0,
                    left: 0,
                    positionHint: '20 / 500',
                    resizable: true,
                    state: this.defaultState(),
                    scrolling: 'yes',
                },
                {
                    title: 'Dos',
                    icon: iconDos,
                    url: './apps/dos/index.htm',
                    width: 640,
                    height: 407,
                    minWidth: 640,
                    minHeight: 407,
                    maxWidth: 640,
                    maxHeight: 407,
                    top: 0,
                    left: 0,
                    positionHint: '20 / 500',
                    resizable: false,
                    state: this.defaultState(),
                    scrolling: 'yes',
                },
                {
                    title: 'Windows 93',
                    icon: iconWindows,
                    url: 'https://www.windows93.net/',
                    width: 640,
                    height: 407,
                    minWidth: 640,
                    minHeight: 407,
                    maxWidth: 640,
                    maxHeight: 407,
                    top: 0,
                    left: 0,
                    positionHint: '20 / 500',
                    resizable: false,
                    state: this.defaultState(),
                    scrolling: 'yes',
                },
                {
                    title: 'Super Markup World',
                    icon: iconSuperMarkupWorld,
                    url: 'http://supermarkupworld.com/game.html',
                    width: 1000,
                    height: 700,
                    minWidth: 100,
                    minHeight: 100,
                    top: 0,
                    left: 0,
                    positionHint: '20 / 500',
                    resizable: true,
                    state: this.defaultState(),
                    scrolling: 'yes',
                },
                {
                    title: 'Retro Campus BBS',
                    icon: iconDialup,
                    url: 'http://bbs.retrocampus.com',
                    width: 1000,
                    height: 700,
                    minWidth: 100,
                    minHeight: 100,
                    top: 0,
                    left: 0,
                    positionHint: '20 / 500',
                    resizable: true,
                    state: this.defaultState(),
                    scrolling: 'yes',
                },                
                
            ]
        }
    },
    methods: {
        defaultState(){
            return {
                        isFocused: false,
                        isMinimized: false,
                        isMaximized: false,
                        isOpen: false,
                        isRunning: false,
                    }
        },
        setBlockPointerEvents(val){
            this.blockPointerEvents = val
        },
        startAppByName(name){
            console.log("startAppByName " + name )
            let appIndex = this.apps.findIndex((app) => {
                return app.title === name;
            })
            console.log(appIndex)
            if (appIndex <= -1){
                console.err('No app found by name' + name)
                return;
            }
            // this.apps[appIndex].state.isFocused = true;
            // this.apps[appIndex].state.isOpen = true;
            // this.apps[appIndex].state.isRunning = true;
            this.openNewApplication(this.apps[appIndex])

        },
        openNewApplication(app){
            console.log(["openNewApplicaton", app ])
            app.state.isRunning = true;
            this.setActive(app)
            this.addToHistory(app)

            Vue.nextTick( () => {
                const appRef = this.getAppRef(app)
                // appRef.width = app.width
                // appRef.height = app.height
                // appRef.top = app.top
                // appRef.left = app.top        
                console.log(appRef)
            })
                // console.log(this.appsHistory)
        },
        refreshWindow(app){
            console.log(this.$refs[app.title+'iframe'])
            // this.$refs[app.title + 'iframe'][0].src = null
            const currentFrame = this.$refs[app.title + 'iframe'][0] 
            currentFrame.src = 'about:blank'
            setTimeout(function(){
                currentFrame.src = app.url
            },1000)
        },
        toggleMinimize(app){
            this.toggleOpen(app)
        },
        unMaximize(app){
            console.log("UNMAXIMIZE")
            if (app.saved){
                app.height = app.saved.height
                app.width = app.saved.width
                app.top = app.saved.top
                app.left = app.saved.left
                delete app.saved
            }
        },
        Maximize(app){
            if (!app.resizable){
                return;
            }
            const appRef = this.getAppRef(app)
            console.log("MAXIMIXE")
            app.saved = {
                width: appRef.width,
                height: appRef.height,
                top: appRef.top,
                left: appRef.left,
            }
            console.log('was saved')
            console.log(appRef.width)
            console.dir(app.saved)

            // appRef.width = document.documentElement.clientWidth;
            // appRef.height = document.documentElement.clientHeight - 90;
            // appRef.top = 0
            // appRef.left = 0
            app.top = 0
            app.left= 0
            app.width = document.documentElement.clientWidth;
            app.height =  document.documentElement.clientHeight - 90;
        },
        toggleMaximize(app){
            if (app.saved){
                this.unMaximize(app);
                return
            }
            this.Maximize(app);
        },
        closeButton(app){
            app.state.isRunning = false;
            app.state.isOpen = false;
            this.unMaximize(app);
            this.removeFromHistory(app);
            this.setNextActive();
            // app.state.isOpen = false;
            // app.state.isFocused = false;
            // this.toggleOpen(app)
        },
        addToHistory(app){
            this.appsHistory.push(app.title)
            this.saveHistoryToStorage();
        },
        removeFromHistory(app){
            var index = this.appsHistory.indexOf(app.title);
            if (index !== -1) this.appsHistory.splice(index, 1);
            this.saveHistoryToStorage();
        },
        saveHistoryToStorage(){
            localStorage.setItem('appHistory', JSON.stringify(this.appsHistory));
        },
        getHistoryFromStorage(){
            return JSON.parse(localStorage.getItem('appHistory'));
        },
        wasResized(app){
            const appRef = this.getAppRef(app)
            console.log(["WAS RESIZED TO DIMENSIONS", appRef.width, appRef.height])
            window.test = appRef
            this.setBlockPointerEvents(false);
        },
        wasMoved(app){
            this.setBlockPointerEvents(false)
        },
        getAppRef(app){
            return this.$refs[app.title][0]
        },
        toggleOpen(app){
            console.log("TOGGLE OPEN!!")
            console.log(app.title)
            console.log(app)
            if (!app.state.isRunning){ //load app because it isnt running
                console.log('load app')
                return this.openNewApplication(app);
            }

 

            if (!app.state.isFocused){
                console.log('set active')

                           //too much going on here, if minimized we need to push back onto history
            // but just switching windows will hit the same code
                if (!app.state.isOpen){
                    this.addToHistory(app)
                }
                this.$refs[app.title][0].activate()
                this.setActive(app)
                return
            }
            console.log('set inactive')
            app.state.isOpen = false
            app.state.isFocused = false
            this.removeFromHistory(app);
            this.setNextActive()

        },
        setNextActive(){
            console.log('set next active')
            console.log(this.appsHistory)
            // if (this.appsHistory.length <= 1) {
            //     return
            // }
            let appTitle = this.appsHistory[this.appsHistory.length - 1];
            
            let nextApp = this.apps.find(function(app){
                return app.title === appTitle;
            })

            if (nextApp){
                nextApp.state.isFocused = true;
                this.$refs[nextApp.title][0].activate()
            } else {
                this.apps.forEach(function(app){
                    app.state.isFocused = false;
                })
            }
        },
        setActive(activeApp){
            this.apps.forEach(function(app){
                if (app.title !== activeApp.title)
                app.state.isFocused = false;
            })
            activeApp.state.isOpen = true
            activeApp.state.isFocused = true;
            
        },
        mouseLeaveHandler(){
            this.setBlockPointerEvents(true)
        },
        mergeLocalApps(){
            let localApps = JSON.parse(localStorage.getItem('localApps')) || []

            this.apps = _.uniqBy([...this.apps, ...localApps.map((app) => {
                return  _.merge(_.cloneDeep(this.appTemplate), app)
            })], 'title');
        },
        mergeRemoteApps(){
            let remoteApps = this.remoteConfig.apps || []

            this.apps = _.uniqBy([...this.apps, ...remoteApps.map((app) => {
                return  _.merge(_.cloneDeep(this.appTemplate), app)
            })], 'title');
        },
        addApp(appData){
            this.apps.push(_.merge(_.cloneDeep(this.appTemplate), appData))
        },
    },
    mounted() {
        // let history = this.getHistoryFromStorage();
        // this.mergeLocalApps())
        Stats.Init()

        //This used to happen in minio setup callback
        // if (!this.remoteConfig){
        //     return
        // }

        // if (this.remoteConfig.apps.length){
        //     this.mergeRemoteApps();
        // }

        // let history = this.remoteConfig.history
        // if (history.length){
        //     history.map((appTitle) => {
        //         this.startAppByName(appTitle)
        //     })
        // }

        // window.apps = this.apps
    }
}

</script>
