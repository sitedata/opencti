import React, { useContext } from 'react';
import * as PropTypes from 'prop-types';
import {
  compose,
  flatten,
  propOr,
  pluck,
  includes,
  uniq,
  pipe,
  filter,
  head,
} from 'ramda';
import withTheme from '@mui/styles/withTheme';
import withStyles from '@mui/styles/withStyles';
import { MapContainer, TileLayer, GeoJSON, Marker } from 'react-leaflet';
import L from 'leaflet';
import inject18n from '../../../../components/i18n';
import { UserContext } from '../../../../utils/Security';

const styles = () => ({
  paper: {
    height: '100%',
    margin: '10px 0 0 0',
    padding: 0,
    borderRadius: 8,
  },
});

const colors = [
  '#fff59d',
  '#ffe082',
  '#ffb300',
  '#ffb74d',
  '#fb8c00',
  '#d95f00',
  '#e64a19',
  '#f44336',
  '#d32f2f',
  '#b71c1c',
];

const pointerIcon = new L.Icon({
  iconUrl: '/static/city_orange.png',
  iconRetinaUrl: '/static/city_orange.png',
  iconAnchor: [5, 55],
  popupAnchor: [10, -44],
  iconSize: [25, 25],
});

const LocationMiniMapTargets = (props) => {
  const { settings } = useContext(UserContext);
  const countriesAliases = pipe(
    pluck('x_opencti_aliases'),
    flatten,
    uniq,
    filter((n) => n !== null),
  )(propOr([], 'countries', props));
  const getStyle = (feature) => {
    if (includes(feature.properties.ISO3, countriesAliases)) {
      const country = head(
        filter(
          (n) => includes(
            feature.properties.ISO3,
            propOr([], 'x_opencti_aliases', n),
          ),
          props.countries,
        ),
      );
      return {
        color: country.level ? colors[country.level] : colors[5],
        weight: 1,
        fillOpacity: props.theme.palette.mode === 'light' ? 0.5 : 0.1,
      };
    }
    return { fillOpacity: 0, color: 'none' };
  };
  const { center, zoom, cities, theme } = props;
  const locatedCities = cities
    ? filter((n) => n.latitude && n.longitude, cities)
    : [];
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        attributionControl={false}
        zoomControl={false}
      >
        <TileLayer
          url={
            theme.palette.mode === 'light'
              ? settings.platform_map_tile_server_light
              : settings.platform_map_tile_server_dark
          }
        />
        <GeoJSON data="" style={getStyle} />
        {locatedCities.map((city) => {
          const position = [city.latitude, city.longitude];
          return (
            <Marker key={city.id} position={position} icon={pointerIcon} />
          );
        })}
      </MapContainer>
    </div>
  );
};

LocationMiniMapTargets.propTypes = {
  countries: PropTypes.array,
  cities: PropTypes.array,
  zoom: PropTypes.number,
  theme: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
  fd: PropTypes.func,
  history: PropTypes.object,
};

export default compose(
  inject18n,
  withTheme,
  withStyles(styles),
)(LocationMiniMapTargets);
