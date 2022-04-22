<template>
    <div class="container">
        <div class="row" v-for="(value, key, index) in form" :key="key">
            <label :for="key">{{key.charAt(0).toUpperCase() + key.slice(1)}}</label>
            <input type="text" :name="key" v-model="form[key]">
        </div>
        <div class="row">
            <button @click="addApp">Add</button>
        </div>
        
    </div>
</template>
<script>
    export default {
        props: ['apps', 'appTemplate'],
        data (){
            return {
                form: {
                    title: undefined,
                    icon: undefined,
                    url: undefined,
                }
            }
        },
        methods: {
            addApp(){
                let localApps = JSON.parse(localStorage.getItem('localApps')) || []
                localApps.push(this.form)
                localStorage.setItem('localApps', JSON.stringify(localApps))
                console.log(this.form)
                this.$emit('added', this.form)

                // this.form.title = undefined;
                // this.form.icon = undefined;
                // this.form.url = undefined;
            }
        }
    }
</script>
<style>
    .container {
        background: rgb(196, 196, 196);
        display: flex;
        flex-direction: column;
        padding: 20px;
        margin: 0;
    }

    .row {
        display: flex;
        justify-content: space-between;
    }

    label {
        margin: 5px;
        margin-right: 15px;
    }

    input {
        margin: 5px;
        width: 300px;
        padding: 5px;
    }

    button {
        padding: 10px 20px;
        font-size: 1rem;
    }

    button:hover {
        cursor: pointer;
    }
</style>
