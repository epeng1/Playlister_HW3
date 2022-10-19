import { useContext } from 'react'
import { GlobalStoreContext } from '../store'

function RemoveSongModal(props) {
    const { store } = useContext(GlobalStoreContext);

    async function handleConfirmRemoveSong() {
        store.addRemoveSongTransaction(store.currentSongIndex, store.currentList.songs[store.currentSongIndex]);
        store.setModal("NONE", -1);
    }

    function handleCancelRemoveSong() {
        store.setModal("NONE", -1);
    }

    let songTitle = "";
    if (store.currentList.songs[store.currentSongIndex]) {
        songTitle = store.currentList.songs[store.currentSongIndex].title;
    }
    let modalClass = "modal";
    if (store.currentModal === "REMOVE_SONG") {
        modalClass += " is-visible"
    }
    return (
        <div
            id="remove-song-modal"
            className={modalClass}
            data-animation="slideInOutLeft">
            <div className="modal-root" id='verify-remove-song-root'>
                <div className="modal-north">
                    Remove {songTitle}?
                </div>
                <div className="modal-center">
                    <div className="modal-center-content">
                        Are you sure you wish to permanently remove {songTitle} from the playlist?
                    </div>
                </div>
                <div className="modal-south">
                    <input type="button" id="remove-song-confirm-button" className="modal-button" onClick={handleConfirmRemoveSong} value='Confirm' />
                    <input type="button" id="remove-song-cancel-button" className="modal-button" onClick={handleCancelRemoveSong} value='Cancel' />
                </div>
            </div>
        </div>
    );
}

export default RemoveSongModal;