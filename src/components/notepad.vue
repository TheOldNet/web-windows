<template>
    <div class="notepad-container">
        <div class="toolbar">
            <div>Open</div>
            <div>Save</div>
        </div>
        <textarea name="" id="notepad" @keyup="saveNote()" v-model="note"></textarea>
    </div>
</template>
<script>
    import * as _ from 'lodash'

    export default {
        data(){
            return {
                bucketName: 'webwindows',
                note: 'Loading Note...'
            }
        },
        created(){
                this.loadNote().then((data) => {
                    this.note = data
                    // notepad = document.getElementById('notepad');
                    // notepad.focus();
                    // notepad.value = data;
                })
        },
        methods: {
            saveNote: _.debounce(function() {
                console.log("not implimented");
            }, 1000),
            loadNote() {
                var data = 'https://github.com/TheOldNet/web-windows'
                return new Promise((resolve, reject) => {
                    console.log("NOT IMPLIMENTED")
                    return resolve(data)
                })
            }
        },
    }       
</script>
<style scoped>
    textarea {
        margin: 0;
        flex: 1;
        padding: 10px;
    }

    .notepad-container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .toolbar{
        display: flex;
        background-color: rgb(196, 196, 196);
    }

    .toolbar > div {
        padding: 5px 10px;
    }

    .toolbar > div:hover {
        cursor: pointer;
        background-color: rgb(167, 167, 167);
    }

</style>
