import { GetterTree, MutationTree, ActionTree } from 'vuex';

import musicPlayerService from '@/services/musicPlayer.service';
import { getArtworkUrl } from '@/utils/utils';
import {
  PAUSE_CURRENT_TRACK,
  PLAY_COLLECTION_AT_INDEX,
  PLAY_NEXT,
  PLAY_PREVIOUS,
  RESUME_CURRENT_TRACK,
  TOGGLE_CURRENT_TRACK,
  APPEND_SONGS,
  ADD_TO_LIBRARY,
  PREPEND_SONGS,
  PLAY_SONGS,
  PLAY_COLLECTION_WITH_SONG,
  SKIP_TO_SONG_AT_INDEX
} from '@/store/actions.type';
import {
  SET_CURRENTLY_PLAYING_SONG,
  SET_IS_PLAYING,
  SET_PLAYBACK_PROGESS,
  SET_SONG_QUEUE,
  SET_SONG_LOADING
} from '@/store/mutations.type';
import {
  MusicPlayerState,
  PlayCollectionAtIndexPayload,
  AppendSongsPayload,
  AddToLibraryPayload,
  PlayCollectionWithSongPayload,
  SkipToSongAtIndexPayload,
  PlaySongsPayload
} from './types';
import { Nullable } from '@/@types/model/model';

const initialState: MusicPlayerState = {
  currentPlaying: null,
  isPlaying: false,
  playbackProgress: 0,
  queuedSongs: [],
  isLoading: false
};

const getters: GetterTree<MusicPlayerState, any> = {
  currentTrackArtwork(state): string {
    return state.currentPlaying
      ? getArtworkUrl(state.currentPlaying.artwork.url, 500, 500)
      : '';
  }
};

const actions: ActionTree<MusicPlayerState, any> = {
  [PLAY_NEXT]() {
    musicPlayerService.playNext();
  },

  [PLAY_PREVIOUS]() {
    musicPlayerService.playPrevious();
  },

  [PLAY_COLLECTION_AT_INDEX](
    context,
    { playParams, index }: PlayCollectionAtIndexPayload
  ) {
    musicPlayerService.playCollectionAtIndex(playParams, index).then(() => {
      context.commit(SET_SONG_QUEUE, musicPlayerService.queuedSongs);
    });
  },

  [TOGGLE_CURRENT_TRACK]({ dispatch }) {
    if (musicPlayerService.isPlaying) {
      dispatch(PAUSE_CURRENT_TRACK);
    } else {
      dispatch(RESUME_CURRENT_TRACK);
    }
  },

  [PAUSE_CURRENT_TRACK]() {
    musicPlayerService.pause();
  },

  [RESUME_CURRENT_TRACK]() {
    return musicPlayerService.play().catch(err => {
      console.log(err);
    });
  },

  [APPEND_SONGS]({ commit }, { items }: AppendSongsPayload) {
    musicPlayerService.appendItemsToQueue(items);
    commit(SET_SONG_QUEUE, musicPlayerService.queuedSongs);
  },

  [ADD_TO_LIBRARY](_, { itemIds, type }: AddToLibraryPayload) {
    return musicPlayerService.addToLibrary(itemIds, type);
  },

  [PLAY_SONGS](context, { ids }: PlaySongsPayload) {
    return musicPlayerService.playSongs(ids).then(() => {
      context.commit(SET_SONG_QUEUE, musicPlayerService.queuedSongs);
    });
  },

  [PLAY_COLLECTION_WITH_SONG](
    context,
    { playParams, songId }: PlayCollectionWithSongPayload
  ) {
    return musicPlayerService
      .playCollectionWithSong(playParams, songId)
      .then(() => {
        context.commit(SET_SONG_QUEUE, musicPlayerService.queuedSongs);
      });
  },

  [SKIP_TO_SONG_AT_INDEX](_, { index }: SkipToSongAtIndexPayload) {
    return musicPlayerService.skipToSongAtIndex(index);
  }
};

/* eslint no-param-reassign: ["error", { "props": false }] */
const mutations: MutationTree<MusicPlayerState> = {
  [SET_CURRENTLY_PLAYING_SONG](state, track: MusicKit.MediaItem) {
    state.currentPlaying = track;
  },

  [SET_IS_PLAYING](state, isPlaying: boolean) {
    state.isPlaying = isPlaying;
  },

  [SET_SONG_LOADING](state, isLoading: boolean) {
    state.isLoading = isLoading;
  },

  [SET_PLAYBACK_PROGESS](state, playbackProgress: number) {
    state.playbackProgress = playbackProgress;
  },

  [SET_SONG_QUEUE](state, songs) {
    state.queuedSongs = songs;
  }
};

export default {
  state: initialState,
  getters,
  actions,
  mutations
};
