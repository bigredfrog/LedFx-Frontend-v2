import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { useTheme } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import SettingsIcon from '@material-ui/icons/Settings';
import VisibilityIcon from '@material-ui/icons/Visibility';
import TuneIcon from '@material-ui/icons/Tune';
import BuildIcon from '@material-ui/icons/Build';
import { NavLink } from 'react-router-dom';
import Collapse from '@material-ui/core/Collapse';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { Clear, Delete, Pause, PlayArrow } from '@material-ui/icons';
import Popover from '../../../components/Popover/Popover';
import EditVirtuals from '../EditVirtuals/EditVirtuals';
import PixelGraph from '../../../components/PixelGraph';
import BladeIcon from '../../../components/Icons/BladeIcon';
import useStyle from './DeviceCard.styles';
import { DeviceCardDefaults, DeviceCardProps } from './DeviceCard.interface';

/**
 * Pixelgraphs will not connect via Websocket in Storybook
 *
 */
const DeviceCard = ({
  yzName,
  virtId,
  index,
  handleDeleteDevice,
  handleEditVirtual,
  handleEditDevice,
  handleClearEffect,
  handlePlayPause,
  yzLinkTo,
  yzStyle,
  yzIconName,
  yzGraphs,
  yzColorIndicator,
  yzEffectName,
  isPlaying,
  yzIsStreaming,
  yzPreviewOnly,
  yzIsEffectSet,
  yzTransitionTime,
  yzIsDevice,
}: DeviceCardProps) => {
  const classes = useStyle();
  const theme = useTheme();
  // eslint-disable-next-line
  const [fade, _setFade] = useState(false);
  const [isActive, setIsActive] = useState(yzIsEffectSet || yzIsStreaming);

  const [expanded, setExpanded] = useState(false);
  const color = 'inherit';

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    setIsActive(yzIsEffectSet || yzIsStreaming);
  }, [yzIsEffectSet, yzIsStreaming]);

  return (
    <NavLink
      to={yzLinkTo}
      className={`${classes.virtualCardPortraitW} ${
        yzIsEffectSet ? 'active' : ''
      }`}
      style={{ ...yzStyle, width: '100%' }}
    >
      <Card className={classes.virtualCardPortrait}>
        <div className={classes.virtualCardContainer}>
          <div className={`${classes.virtualIconWrapper}`}>
            <BladeIcon
              colorIndicator={false}
              name={yzIconName}
              className={`${classes.virtualIcon} ${!yzGraphs ? 'graphs' : ''} ${
                expanded ? 'extended' : ''
              }`}
              style={{ zIndex: 3 }}
              card
            />
          </div>

          <div style={{ padding: '0 0.5rem' }}>
            <Typography
              variant="h6"
              style={{
                lineHeight: 1,
                color: yzColorIndicator
                  ? theme.palette.primary.light
                  : 'inherit',
              }}
            >
              {yzName}
            </Typography>
            {yzEffectName ? (
              <Typography
                variant="body1"
                color="textSecondary"
                style={{ height: 25, display: 'flex', alignItems: 'center' }}
              >
                Effect: {yzEffectName}
                <Button
                  size="small"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePlayPause();
                  }}
                  style={{
                    color: '#999',
                    minWidth: 'unset',
                    zIndex: expanded ? 1 : 3,
                  }}
                >
                  {isPlaying ? <Pause /> : <PlayArrow />}
                </Button>
                <Button
                  size="small"
                  onClick={(e) => {
                    e.preventDefault();
                    handleClearEffect(virtId);
                  }}
                  style={{
                    color: '#999',
                    minWidth: 'unset',
                    zIndex: expanded ? 1 : 3,
                  }}
                >
                  <Clear />
                </Button>
              </Typography>
            ) : yzIsStreaming ? (
              <Typography
                variant="body1"
                color="textSecondary"
                style={{ height: 25 }}
              >
                Streaming...
              </Typography>
            ) : (
              <Typography
                variant="body1"
                style={{ color: theme.palette.text.disabled, height: 25 }}
              >
                off
              </Typography>
            )}
          </div>

          <div>
            {yzPreviewOnly && (
              <Button variant="text" disabled size="small">
                <VisibilityIcon />
              </Button>
            )}
          </div>

          <IconButton
            className={clsx(classes.expand, {
              [classes.expandOpen]: expanded,
            })}
            onClick={(e) => {
              e.preventDefault();
              handleExpandClick();
            }}
            aria-expanded={expanded}
            aria-label="show more"
            style={{ zIndex: 3, color: '#999' }}
          >
            <ExpandMoreIcon className={`step-devices-two-${index}`} />
          </IconButton>
        </div>
        <div
          className={clsx(classes.pixelbar, {
            [classes.pixelbarOut]: fade,
          })}
          style={{ transitionDuration: `${yzTransitionTime}s` }}
        >
          <PixelGraph
            intGraphs={yzGraphs}
            active={isActive}
            virtId={virtId}
            className="step-devices-seven"
          />
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            right: 0,
            zIndex: 2,
          }}
        >
          <Collapse
            in={expanded}
            timeout="auto"
            unmountOnExit
            className={classes.buttonBarMobile}
          >
            {/* eslint-disable-next-line */}
          <div className={`${classes.buttonBarMobileWrapper} ${!yzGraphs ? 'graphs' : ''} ${expanded ? 'extended' : ''}`} onClick={(e) => e.preventDefault()}>
              <div />
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                }}
              >
                <Popover
                  variant="text"
                  startIcon={<Delete />}
                  label="delete"
                  color={color}
                  onConfirm={() => handleDeleteDevice(virtId)}
                  className={`step-devices-three-${index}`}
                  style={{ width: '100%' }}
                />

                {yzIsDevice ? (
                  <Button
                    variant="text"
                    color={color}
                    size="small"
                    startIcon={<BuildIcon />}
                    className={`step-devices-four-${index}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleEditDevice(yzIsDevice);
                    }}
                  >
                    Edit Device
                  </Button>
                ) : (
                  <EditVirtuals
                    label="Edit Virtual"
                    variant="text"
                    color={color}
                    virtId={virtId}
                    icon={undefined}
                    className="step-devices-six"
                    startIcon={<TuneIcon />}
                    type={undefined}
                    innerKey={undefined}
                  />
                )}
                <Button
                  variant="text"
                  size="small"
                  startIcon={<SettingsIcon />}
                  color={color}
                  className={`step-devices-five-${index}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleEditVirtual(virtId);
                  }}
                >
                  Settings
                </Button>
              </div>
            </div>
          </Collapse>
        </div>
      </Card>
    </NavLink>
  );
};

DeviceCard.defaultProps = DeviceCardDefaults;

export default DeviceCard;