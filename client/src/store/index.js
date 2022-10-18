import { createContext, useState } from 'react'
import jsTPS from '../common/jsTPS'
import api from '../api'
import CreateSong_Transaction from '../transactions/CreateSong_Transaction.js'
import MoveSong_Transaction from '../transactions/MoveSong_Transaction.js';
import RemoveSong_Transaction from '../transactions/RemoveSong_Transaction.js';
import UpdateSong_Transaction from '../transactions/UpdateSong_Transaction.js';
export const GlobalStoreContext = createContext({});
/*
    This is our global data store. Note that it uses the Flux design pattern,
    which makes use of things like actions and reducers. 
    
    @author McKilla Gorilla
*/

// THESE ARE ALL THE TYPES OF UPDATES TO OUR GLOBAL
// DATA STORE STATE THAT CAN BE PROCESSED
export const GlobalStoreActionType = {
    CHANGE_LIST_NAME: "CHANGE_LIST_NAME",
    CLOSE_CURRENT_LIST: "CLOSE_CURRENT_LIST",
    CREATE_NEW_LIST: "CREATE_NEW_LIST",
    LOAD_ID_NAME_PAIRS: "LOAD_ID_NAME_PAIRS",
    SET_CURRENT_LIST: "SET_CURRENT_LIST",
    SET_LIST_NAME_EDIT_ACTIVE: "SET_LIST_NAME_EDIT_ACTIVE",
    MARK_LIST_FOR_DELETION: "MARK_LIST_FOR_DELETION",
    SET_MODAL: "SET_MODAL"
}

// WE'LL NEED THIS TO PROCESS TRANSACTIONS
const tps = new jsTPS();

const CurrentModal = {
    NONE : "NONE",
    DELETE_LIST : "DELETE_LIST",
    EDIT_SONG : "EDIT_SONG",
    REMOVE_SONG : "REMOVE_SONG"
}

// WITH THIS WE'RE MAKING OUR GLOBAL DATA STORE
// AVAILABLE TO THE REST OF THE APPLICATION
export const useGlobalStore = () => {
    // THESE ARE ALL THE THINGS OUR DATA STORE WILL MANAGE
    const [store, setStore] = useState({
        idNamePairs: [],
        currentList: null,
        newListCounter: 0,
        listNameActive: false,
        currentModal: CurrentModal.NONE,
        currentSongIndex: -1,
        markedList: null
    });

    // HERE'S THE DATA STORE'S REDUCER, IT MUST
    // HANDLE EVERY TYPE OF STATE CHANGE
    const storeReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            // LIST UPDATE OF ITS NAME
            case GlobalStoreActionType.CHANGE_LIST_NAME: {
                return setStore({
                    idNamePairs: payload.idNamePairs,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    listNameActive: false,
                    currentModal: CurrentModal.NONE,
                    currentSongIndex: -1
                });
            }
            // STOP EDITING THE CURRENT LIST
            case GlobalStoreActionType.CLOSE_CURRENT_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    listNameActive: false,
                    currentModal: CurrentModal.NONE,
                    currentSongIndex: -1
                })
            }
            // CREATE A NEW LIST
            case GlobalStoreActionType.CREATE_NEW_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    newListCounter: store.newListCounter + 1,
                    listNameActive: false,
                    currentModal: CurrentModal.NONE,
                    currentSongIndex: -1
                })
            }
            // GET ALL THE LISTS SO WE CAN PRESENT THEM
            case GlobalStoreActionType.LOAD_ID_NAME_PAIRS: {
                return setStore({
                    idNamePairs: payload,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    listNameActive: false,
                    currentModal: CurrentModal.NONE,
                    currentSongIndex: -1
                });
            }
            // PREPARE TO DELETE A LIST
            case GlobalStoreActionType.MARK_LIST_FOR_DELETION: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    listNameActive: false,
                    currentModal: CurrentModal.NONE,
                    currentSongIndex: -1,
                });
            }
            // UPDATE A LIST
            case GlobalStoreActionType.SET_CURRENT_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    newListCounter: store.newListCounter,
                    listNameActive: false,
                    currentModal: CurrentModal.NONE,
                    currentSongIndex: -1
                });
            }
            // START EDITING A LIST NAME
            case GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    newListCounter: store.newListCounter,
                    listNameActive: true,
                    currentModal: CurrentModal.NONE,
                    currentSongIndex: -1
                });
            }
            case GlobalStoreActionType.SET_MODAL: {
                return setStore((prevStore) => ({
                    ...prevStore,
                    currentModal: payload.modal,
                    currentSongIndex: payload.index,
                    markedList: payload.list
                }));
            }
            default:
                return store;
        }
    }
    // SETUP CTRL-Z AND CTRL-Y
    let ctrlPressed = false;

    let handleAppKeyDown = (keyEvent) => {
        let CTRL_KEY_CODE = 17;
        if (keyEvent.which === CTRL_KEY_CODE) {
            ctrlPressed = true;
        }
        else if (keyEvent.key.toLowerCase() === "z") {
            if (ctrlPressed) {
                store.undo();
            }
        }
        else if (keyEvent.key.toLowerCase() === "y") {
            if (ctrlPressed) {
                store.redo();
            }
        }
    }
    let handleAppKeyUp = (keyEvent) => {
        if (keyEvent.which === 17)
            ctrlPressed = false;
    }
    document.onkeydown = handleAppKeyDown;
    document.onkeyup = handleAppKeyUp;
    // THESE ARE THE FUNCTIONS THAT WILL UPDATE OUR STORE AND
    // DRIVE THE STATE OF THE APPLICATION. WE'LL CALL THESE IN 
    // RESPONSE TO EVENTS INSIDE OUR COMPONENTS.

    // THIS FUNCTION PROCESSES CHANGING A LIST NAME
    store.changeListName = function (id, newName) {
        // GET THE LIST
        async function asyncChangeListName(id) {
            let response = await api.getPlaylistById(id);
            if (response.data.success) {
                let playlist = response.data.playlist;
                playlist.name = newName;
                async function updateList(playlist) {
                    response = await api.updatePlaylistById(playlist._id, playlist);
                    if (response.data.success) {
                        async function getListPairs(playlist) {
                            response = await api.getPlaylistPairs();
                            if (response.data.success) {
                                let pairsArray = response.data.idNamePairs;
                                storeReducer({
                                    type: GlobalStoreActionType.CHANGE_LIST_NAME,
                                    payload: {
                                        idNamePairs: pairsArray,
                                        playlist: playlist
                                    }
                                });
                            }
                        }
                        getListPairs(playlist);
                    }
                }
                updateList(playlist);
            }
        }
        asyncChangeListName(id);
    }

    // THIS FUNCTION PROCESSES CLOSING THE CURRENTLY LOADED LIST
    store.closeCurrentList = function () {
        storeReducer({
            type: GlobalStoreActionType.CLOSE_CURRENT_LIST,
            payload: {}
        });
        tps.clearAllTransactions();
    }

    store.setModal = function (modal, index, list) {
        storeReducer({
            type: GlobalStoreActionType.SET_MODAL,
            payload: {
                modal: modal,
                index: index,
                list: list
            }
        })
        // store.currentModal = modal;
        // store.currentSongIndex = index;
    }

    // THIS FUNCTION LOADS ALL THE ID, NAME PAIRS SO WE CAN LIST ALL THE LISTS
    store.loadIdNamePairs = function () {
        async function asyncLoadIdNamePairs() {
            const response = await api.getPlaylistPairs();
            if (response.data.success) {
                let pairsArray = response.data.idNamePairs;
                storeReducer({
                    type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                    payload: pairsArray
                });
            }
            else {
                console.log("API FAILED TO GET THE LIST PAIRS");
            }
        }
        asyncLoadIdNamePairs();
    }

    store.setCurrentList = function (id) {
        async function asyncSetCurrentList(id) {
            let response = await api.getPlaylistById(id);
            if (response.data.success) {
                let playlist = response.data.playlist;

                if (response.data.success) {
                    storeReducer({
                        type: GlobalStoreActionType.SET_CURRENT_LIST,
                        payload: playlist
                    });
                    store.history.push("/playlist/" + playlist._id);
                }
            }
        }
        asyncSetCurrentList(id);
    }
    store.getPlaylistSize = function() {
        return store.currentList.songs.length;
    }
    store.undo = function () {
        tps.undoTransaction();
    }
    store.redo = function () {
        tps.doTransaction();
    }
    store.canUndo = function() {
        return tps.hasTransactionToUndo();
    }
    store.canRedo = function() {
        return tps.hasTransactionToRedo();
    }
    store.hasCurrentList = function() {
        return (store.currentList !== null);
    }

    // THIS FUNCTION ENABLES THE PROCESS OF EDITING A LIST NAME
    store.setListNameEditActive = function () {
        storeReducer({
            type: GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE,
            payload: {}
        });
    }

    store.createNewList = function () {
        async function asyncCreateList(body) {
            let response = await api.createPlaylist(body);
            if (response.data.success) {
                let playlist = response.data.playlist;
                storeReducer({
                    type: GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE,
                    payload: {}
                });
                store.setCurrentList(playlist._id);
            }
        }
        asyncCreateList({name: "Untitled", songs: []});
    }

    store.deleteList = function (id) {
        async function asyncDeleteList(id) {
            storeReducer({
                type: GlobalStoreActionType.MARK_LIST_FOR_DELETION,
                payload: {}
            });
            let response = await api.deletePlaylist(id);
            if (response.data.success) {
                store.loadIdNamePairs();
            }
        }
        asyncDeleteList(id);
    }

    store.moveSong = async function (start, end) {
        let list = store.currentList;
        if (start < end) {
            let temp = list.songs[start];
            for (let i = start; i < end; i++) {
                list.songs[i] = list.songs[i + 1];
            }
            list.songs[end] = temp;
        }
        else if (start > end) {
            let temp = list.songs[start];
            for (let i = start; i > end; i--) {
                list.songs[i] = list.songs[i - 1];
            }
            list.songs[end] = temp;
        }
        let id = list._id;
        await api.updatePlaylistById(id, list)
        store.setCurrentList(id);
    }

    store.addMoveSongTransaction = function (start, end) {
        let transaction = new MoveSong_Transaction(this, start, end);
        tps.addTransaction(transaction);
    }

    store.removeSong = async function (index) {
        let list = store.currentList;
        list.songs.splice(index, 1);
        let id = list._id;
        await api.updatePlaylistById(id, list);
        store.setCurrentList(id);
    }

    store.addRemoveSongTransaction = function (index, song) {
        let transaction = new RemoveSong_Transaction(this, index, song);
        tps.addTransaction(transaction);
    }

    store.createSong = async function (index, song) {
        let list = store.currentList;
        list.songs.splice(index, 0, song);
        let id = list._id;
        await api.updatePlaylistById(id, list);
        store.setCurrentList(id);
    }

    store.addCreateSongTransaction = function (index, title, artist, id) {
        let song = {
            title: title,
            artist: artist,
            youTubeId: id
        };
        let transaction = new CreateSong_Transaction(this, index, song);
        tps.addTransaction(transaction);
    }

    store.updateSong = async function (index, song) {
        let list = store.currentList;
        list.songs.splice(index, 1, song);
        let id = list._id;
        await api.updatePlaylistById(id, list);
        store.setCurrentList(id);
    }

    store.addUpdateSongTransaction = function (index, oldSong, newSong) {
        let transaction = new UpdateSong_Transaction(this, index, oldSong, newSong);
        tps.addTransaction(transaction);
    }

    // THIS GIVES OUR STORE AND ITS REDUCER TO ANY COMPONENT THAT NEEDS IT
    return { store, storeReducer };
}