import React, { useContext } from 'react'
import { GlobalStoreContext } from '../store'

function SongCard(props) {
    const { store } = useContext(GlobalStoreContext);
    
    let handleDragStart = (event) => {
        event.dataTransfer.setData("song", event.target.id);
    }
    let handleDragOver = (event) => {
        event.preventDefault();
    }
    let handleDragEnter = (event) => {
        event.preventDefault();
    }
    let handleDragLeave = (event) => {
        event.preventDefault();
    }
    let handleDrop = (event) => {
        event.preventDefault();
        let target = event.target;
        let targetId = target.id;
        if (!targetId.includes("song-")) {
            return;
        }
        targetId = Number(targetId.charAt(target.id.indexOf("-") + 1));
        let sourceId = event.dataTransfer.getData("song");
        if (!sourceId.includes("song-")) {
            return;
        }
        sourceId = Number(sourceId.charAt(sourceId.indexOf("-") + 1));

        // ASK THE MODEL TO MOVE THE DATA
        store.addMoveSongTransaction(sourceId, targetId);
    }
    let handleShowRemoveSongModal = (event) => {
        // @todo: hook up remove song modal
        event.stopPropagation();
        store.addRemoveSongTransaction(index);
    }

    const { song, index } = props;
    let cardClass = "list-card unselected-list-card";
    return (
        <div
            key={index}
            id={'song-' + index + '-card'}
            className={cardClass}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            draggable="true"
            //onClick={handleClick}
        >
            {index + 1}.
            <a
                id={'song-' + index + '-link'}
                className="song-link"
                href={"https://www.youtube.com/watch?v=" + song.youTubeId}>
                {song.title} by {song.artist}
            </a>
            <input
                type="button"
                id={"remove-song-" + index}
                className="list-card-button"
                onClick={handleShowRemoveSongModal}
                value={"\u2715"}
            />
        </div>
    );
}

export default SongCard;