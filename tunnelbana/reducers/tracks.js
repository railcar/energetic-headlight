import Immutable from "immutable";
import { createReducer } from "signalbox";
import actions from "../actions";

const automerge = (state, action) => {
  const oldTracks = selectors.byConnectionId(state, action.connection.id);
  const newTracks = action.tracks;

  const oldIds = oldTracks.map(track => track.get("id")).toJS();
  const newIds = Object.keys(newTracks);

  const deleteIds = oldIds.filter(oldId => {
    const goneInNewIds = !newIds.includes(oldId);
    return goneInNewIds;
  });

  return state.merge(Immutable.fromJS(action.tracks)).deleteAll(deleteIds);
};

export const reducer = createReducer(new Immutable.Map(), {
  [actions.CREATE_TRACK](state, action) {
    return state.set(
      action.track.id,
      Immutable.fromJS({
        id: action.track.id,
        connectionId: action.track.connectionId,
        lineId: action.track.lineId,
        sourceId: action.track.sourceId,
        destinationId: action.track.destinationId,
        ordinality: action.track.ordinality,
        x1: action.track.x1,
        y1: action.track.y1,
        x2: action.track.x2,
        y2: action.track.y2
      })
    );
  },

  [actions.UPDATE_TRACK](state, action) {
    return state.update(action.track.id, track => {
      return track.merge(Immutable.fromJS(action.track));
    });
  },

  [actions.DELETE_TRACK](state, action) {
    return state.delete(action.track.id);
  },

  [actions.CREATE_CONNECTION](state, action) {
    return automerge(state, action);
  },

  [actions.DRAG_TERMINAL](state, action) {
    return automerge(state, action);
  },

  [actions.REALIZE_CONNECTION](state, action) {
    return automerge(state, action);
  },

  [actions.ABANDON_CONNECTION](state, action) {
    const trackIds = selectors
      .byConnectionId(state, action.connection.id)
      .toJS()
      .map(t => t.id);
    return state.deleteAll(trackIds);
  }
});

export const selectors = {
  all(state) {
    return state.toList();
  },

  byId(state, id) {
    return state.get(id);
  },

  byConnectionId(state, connectionId) {
    return state.filter(t => t.get("connectionId") === connectionId).toList();
  },

  forRenderingConnection(state, connectionId) {
    return selectors
      .byConnectionId(state, connectionId)
      .toList()
      .sort((a, b) => {
        const aOrdinality = a.get("ordinality");
        const bOrdinality = b.get("ordinality");
        if (aOrdinality === bOrdinality) {
          return 0;
        } else if (aOrdinality > bOrdinality) {
          return 1;
        } else {
          return -1;
        }
      });
  },

  forJourney(state, journey) {
    const forwardsTracks = state.filter(
      track =>
        track.get("connectionId") === journey.connectionId &&
        track.get("sourceId") === journey.sourceId &&
        track.get("destinationId") === journey.destinationId
    );
    if (forwardsTracks.size) {
      return forwardsTracks.toList().sort((a, b) => {
        const aOrdinality = a.get("ordinality");
        const bOrdinality = b.get("ordinality");
        if (aOrdinality === bOrdinality) {
          return 0;
        } else if (aOrdinality > bOrdinality) {
          return 1;
        } else {
          return -1;
        }
      });
    }

    const backwardsTracks = state.filter(
      track =>
        track.get("connectionId") === journey.connectionId &&
        track.get("sourceId") === journey.destinationId &&
        track.get("destinationId") === journey.sourceId
    );
    if (backwardsTracks.size) {
      return backwardsTracks
        .toList()
        .map(track =>
          track.merge(
            Immutable.fromJS({
              x1: track.get("x2"),
              y1: track.get("y2"),
              x2: track.get("x1"),
              y2: track.get("y1")
            })
          )
        )
        .sort((a, b) => {
          const aOrdinality = a.get("ordinality");
          const bOrdinality = b.get("ordinality");
          if (aOrdinality === bOrdinality) {
            return 0;
          } else if (aOrdinality > bOrdinality) {
            return -1;
          } else {
            return 1;
          }
        });
    }

    return new Immutable.List();
  }
};
