import { useContext } from 'react'
import { GlobalStoreContext } from '../store'
import { useHistory } from 'react-router-dom'
/*
    This toolbar is a functional React component that
    manages the undo/redo/close buttons.
    
    @author McKilla Gorilla
*/
function EditToolbar() {
    const { store } = useContext(GlobalStoreContext);
    const history = useHistory();

    let undoClass = "playlister-button";
    let redoClass = "playlister-button";
    let hasListClass = "playlister-button";
    if (!store.canUndo()) undoClass += " disabled";
    if (!store.canRedo()) redoClass += " disabled";
    if (!store.hasCurrentList()) hasListClass += " disabled"

    function handleUndo() {
        store.undo();
    }
    function handleRedo() {
        store.redo();
    }
    function handleClose() {
        history.push("/");
        store.closeCurrentList();
    }
    function handleAdd() {
        store.addCreateSongTransaction(store.getPlaylistSize(), "Untitled", "?", "dQw4w9WgXcQ")
    }
    let editStatus = false;
    if (store.isListNameEditActive) {
        editStatus = true;
    }
    return (
        <span id="edit-toolbar">
            <input
                type="button"
                id='add-song-button'
                disabled={editStatus || !store.hasCurrentList()}
                value="+"
                className={hasListClass}
                onClick={handleAdd}
                style={{height:66 + 'px'}}
            />
            <input
                type="button"
                id='undo-button'
                disabled={editStatus || !store.canUndo()}
                value="⟲"
                className={undoClass}
                onClick={handleUndo}
            />
            <input
                type="button"
                id='redo-button'
                disabled={editStatus || !store.canRedo()}
                value="⟳"
                className={redoClass}
                onClick={handleRedo}
            />
            <input
                type="button"
                id='close-button'
                disabled={editStatus || !store.hasCurrentList()}
                value="&#x2715;"
                className={hasListClass}
                onClick={handleClose}
            />
        </span>);
}

export default EditToolbar;