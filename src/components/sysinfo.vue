<template>
    <div class="sysinfo">
        <!-- <table>
            <tr>
                <td>Date</td>
                <td>{{time}}</td>
            </tr>
            <tr>
                <td>Battery</td>
                <td>{{battery.level * 100 }} %</td>
            </tr>
            <tr>
                <td></td>
                <td>Charging: {{battery.charging}}</td>
            </tr>
            <tr>
                <td></td>
                <td>Charge Time : {{battery.chargingTime / 60 }} mins</td>
            </tr>
            <tr>
                <td></td>
                <td>Discharging Time : {{battery.dischargingTime / 60}} mins</td>
            </tr>  
            <tr>
                <td>Network</td>
                <td>Online: {{connection.online}}</td>
            </tr>                                              
            <tr>
                <td></td>
                <td>Downlink: {{connection.downlink}} Mbps</td>
            </tr>
            <tr>
                <td></td>
                <td>Type: {{connection.effectiveType}}</td>
            </tr>   
            <tr>
                <td></td>
                <td>Round Trip Time: {{connection.rtt}}ms</td>
            </tr>                                                                                              
        </table> -->

        
        {{time}}
        <table v-if="battery">
            <tr>
                <th colspan="2">Battery</th>
            </tr>  
            <tr v-for="(value, key, index) in battery" :key="index">
                <td>{{key}}</td>
                <td>{{value}}</td>
            </tr>                                                                                              
        </table>

        <table>
            <tr>
                <th colspan="2">Network</th>
            </tr>  
            <tr v-for="(value, key) in connection" :key="key">
                <td>{{key}}</td>
                <td>{{value}}</td>
            </tr>                                                                                              
        </table>

        <table v-if="system">
            <tr>
                <th colspan="2">System</th>
            </tr>  
            <tr v-for="(value, key, index) in system" :key="index">
                <td>{{key}}</td>
                <td>{{value}}</td>
            </tr>                                                                                              
        </table>


        <table v-if="internet">
            <tr>
                <th colspan="2">Internet</th>
            </tr>  
            <tr v-for="(value, key, index) in internet" :key="index">
                <td>{{key}}</td>
                <td>{{value}}</td>
            </tr>                                                                                              
        </table>
    </div>
</template>
<script>

    import axios from 'axios'

    export default {
        data() {
            return {
                time: undefined,                
                battery: {
                    charging: undefined,
                    chargingTime: undefined,
                    dischargingTime: undefined,
                    level: undefined,
                },
                connection: {
                    downlink: 'sdf',
                    effectiveType: 'sdf',
                    rtt: 'sdf',
                    online: 'sdf',
                },
                system: {
                    cores: undefined,
                    ram: undefined,
                    javaEnabled: undefined,
                    cookieEnabled: undefined,
                    language: undefined,
                    maxTouchPoints: undefined,
                },
                internet: undefined

            }
        },
        methods: {
            getStats(){
                navigator.getBattery().then((battery)=>{
                    this.battery = {
                        charging: battery.charging,
                        chargingTime: `${battery.chargingTime / 60} mins`,
                        dischargingTime: `${battery.dischargingTime /60} mins`,
                        level: `${parseInt(battery.level * 100)}%`,
                    }
                })

                this.connection = {
                    downlink: navigator.connection.downlink,
                    effectiveType: navigator.connection.effectiveType,
                    rtt: navigator.connection.rtt,
                    online: navigator.onLine,
                }

                var d = new Date();
                this.time = d.toLocaleString()  
            },
            getInternetStats(){
                axios.get('https://ipapi.co/json/')
                    .then((response) => {
                        this.internet = response.data
                        console.log(response);
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            },
            getSystemStats(){
                this.system.cores = navigator.hardwareConcurrency
                this.system.ram = navigator.deviceMemory
                this.system.javaEnabled = navigator.javaEnabled()
                this.system.cookieEnabled = navigator.cookieEnabled
                this.system.language = navigator.language
                this.system.maxTouchPoints = navigator.maxTouchPoints
            }
        },
        mounted() {
            this.getStats()
            this.getSystemStats()
            this.getInternetStats()

            setInterval(() => {
                this.getStats()
            }, 1000)
        }
    }
</script>
<style scoped>
    .sysinfo {
        background: white;
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        overflow-y: scroll;
    }

    table {
        text-align: left;
        color: black;
        margin-bottom: 20px;
    }

    td {
        padding: 0px 30px;
    }
</style>
