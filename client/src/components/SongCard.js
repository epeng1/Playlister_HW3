import React, { useContext, useState } from 'react'
import { GlobalStoreContext } from '../store'

function SongCard(props) {
    const { store } = useContext(GlobalStoreContext);
    const [editActive, setEditActive] = useState(false);
    const [state, setState] = useState({
        title: "",
        artist: "",
        youTubeId: ""
    })
    const [oldSong, setOldSong] = useState({
        title: "",
        artist: "",
        youTubeId: ""
    })
    
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
        store.addRemoveSongTransaction(index, song);
    }
    let handleClick = (event) => {
        if (event.detail === 2) {
            setOldSong({
                title: song.title,
                artist: song.artist,
                youTubeId: song.youTubeId
            })
            setState({
                title: song.title,
                artist: song.artist,
                youTubeId: song.youTubeId
            })
            toggleEdit(event);
        }
    }
    let toggleEdit = (event) => {
        event.stopPropagation();
        setEditActive(!editActive);
    }
    let handleChange = (event) => {
        const value = event.target.value;
        setState({
            ...state,
            [event.target.name]: value
        });
    }
    let handleKeyPress = (event) => {
        if (event.code === "Enter") {
            store.addUpdateSongTransaction(index, oldSong, state)
            toggleEdit(event);
        }
    }

    const { song, index } = props;
    let cardClass = "list-card unselected-list-card";
    let cardElement =
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
            onClick={handleClick}
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
        </div>;
    
    if (editActive) {
        cardElement =
            <div
                id={'song-' + index + '-card'}
                className='list-card'>
                <span> Title: </span>
                <input
                    id={"song-" + index + "-title"}
                    name="title"
                    type='text'
                    defaultValue={song.title}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}/>
                <p></p>
                <span> Artist: </span>
                <input
                    id={"song-" + index + "-artist"}
                    name="artist"
                    type='text'
                    defaultValue={song.artist}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}/>
                <p></p>
                <span> YouTube ID: </span>
                <input
                    id={"song-" + index + "-youTubeId"}
                    name="youTubeId"
                    type='text'
                    defaultValue={song.youTubeId}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}/>
            </div>
    }
    return (cardElement);
}

export default SongCard;