import { useContext } from 'react'
import { GlobalStoreContext } from '../store'

function DeleteListModal(props) {
    const { store } = useContext(GlobalStoreContext);

    async function handleConfirmDeleteList() {
        if (store.markedList) {
            await store.deleteList(store.markedList._id);
        }
        store.loadIdNamePairs();
        store.setModal("NONE", -1);
    }

    function handleCancelDeleteList() {
        store.setModal("NONE", -1);
    }
    
    let name = "";
    if (store.markedList) {
        name = store.markedList.name;
    }
    let modalClass = "modal";
    if (store.currentModal === "DELETE_LIST") {
        modalClass += " is-visible"
    }
    return (
        <div
            id="delete-list-modal"
            className={modalClass}
            data-animation="slideInOutLeft">
            <div className="modal-root" id='verify-delete-list-root'>
                <div className="modal-north">
                Delete the {name} playlist?
                </div>
                <div className="modal-center">
                    <div className="modal-center-content">
                        Are you sure you wish to permanently delete the {name} playlist?
                    </div>
                </div>
                <div className="modal-south">
                    <input type="button" id="remove-song-confirm-button" className="modal-button" onClick={handleConfirmDeleteList} value='Confirm' />
                    <input type="button" id="remove-song-cancel-button" className="modal-button" onClick={handleCancelDeleteList} value='Cancel' />
                </div>
            </div>
        </div>
    );
}

export default DeleteListModal;