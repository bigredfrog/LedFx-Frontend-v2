/* eslint-disable react/jsx-no-useless-fragment */
import { useEffect, useState } from 'react'
import {
  AppBar,
  Box,
  Link,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  Toolbar,
  Divider,
  useTheme,
  CardMedia,
  Chip,
  Select,
  MenuItem,
  ListSubheader,
} from '@mui/material'
import { Clear, Undo, NavigateBefore } from '@mui/icons-material'
// import merge from 'ts-deepmerge'
import useStore from '../../store/useStore'
import { filterKeys, ordered } from '../../utils/helpers'

import BladeIcon from '../Icons/BladeIcon/BladeIcon'

// Based on: https://stackoverflow.com/a/55736757/1762224

const EditSceneDialog = () => {
  const theme = useTheme()
  const [name, setName] = useState('')
  const [image, setImage] = useState('')
  const [tags, setTags] = useState('')
  const [url, setUrl] = useState('')
  const [payload, setPayload] = useState('')
  const [invalid, setInvalid] = useState(false)
  // const [ledfxPreset, setEffectPreset] = useState(
  //   undefined as string | false | undefined
  // )
  const [scVirtualsToIgnore, setScVirtualsToIgnore] = useState<string[]>([])
  const setVirtualEffect = useStore((state) => state.setVirtualEffect)
  const getVirtuals = useStore((state) => state.getVirtuals)

  const activatePreset = useStore((state) => state.activatePreset)
  const addScene = useStore((state) => state.addScene)
  const getScenes = useStore((state) => state.getScenes)
  const scenes = useStore((state) => state.scenes)
  const { user_presets } = useStore((state) => state.config)
  const { effects } = useStore((state) => state.schemas)
  const getLedFxPresets = useStore((state) => state.getLedFxPresets)
  const open = useStore((state) => state.dialogs.addScene?.edit || false)
  // const key = useStore((state: any) => state.dialogs.addScene?.sceneKey || '');
  const data = useStore((state: any) => state.dialogs.addScene?.editData)
  const features = useStore((state) => state.features)

  const sceneActiveTags = useStore((state) => state.ui.sceneActiveTags)
  const toggletSceneActiveTag = useStore(
    (state) => state.ui.toggletSceneActiveTag
  )

  const sceneImage = (iconName: string) =>
    iconName && iconName.startsWith('image:') ? (
      <div>
        <CardMedia
          style={{
            height: features.scenechips ? 140 : 125,
            width: 334,
            marginTop: '1rem',
          }}
          image={iconName.split('image:')[1]}
          title="Contemplative Reptile"
        />
      </div>
    ) : (
      <div>
        <BladeIcon
          scene
          style={{
            height: 140,
            width: 334,
            display: 'flex',
            alignItems: 'center',
            margin: `${features.scenechips ? 0 : '1.25rem'} auto 0`,
            justifyContent: 'center',
            fontSize: 140,
            '& > span:before': {
              position: 'relative',
            },
          }}
          // className={classes.iconMedia}
          name={iconName}
        />
      </div>
    )
  const setDialogOpenAddScene = useStore((state) => state.setDialogOpenAddScene)

  function isValidURL(string: string) {
    const res = string.match(
      /(?![\s\S])|\d(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_.~#?&//=]*)/g
    )
    return res !== null
  }

  useEffect(() => {
    if (data) {
      setName(data?.name)
      setImage(data?.scene_image)
      setTags(data?.scene_tags)
      setUrl(data?.scene_puturl)
      setPayload(data?.scene_payload)
    }
  }, [data])
  const handleClose = () => {
    setDialogOpenAddScene(false, false)
  }

  const handleAddScene = () => {
    addScene(name, image, tags, url, payload).then(() => {
      getScenes()
    })
    setName('')
    setImage('')
    setTags('')
    setUrl('')
    setPayload('')
    setDialogOpenAddScene(false, false)
  }
  const handleAddSceneWithVirtuals = () => {
    addScene(
      name,
      image,
      tags,
      url,
      payload,
      filterKeys(scenes[data.name.toLowerCase()].virtuals, scVirtualsToIgnore)
    ).then(() => {
      getScenes()
    })
    setName('')
    setImage('')
    setTags('')
    setUrl('')
    setPayload('')
    setDialogOpenAddScene(false, false)
  }
  const [lp, setLp] = useState(undefined as any)

  useEffect(() => {
    getLedFxPresets().then((ledfx_presets) => {
      setLp(ledfx_presets)
    })
  }, [])

  const renderPresets = (
    ledfx_presets: any,
    // user_presets: any,
    dev: string,
    effectId: string
  ) => {
    if (ledfx_presets) {
      const ledfxPreset =
        ledfx_presets &&
        Object.keys(ledfx_presets).length > 0 &&
        Object.keys(ledfx_presets).find(
          (k) =>
            JSON.stringify(ordered((ledfx_presets[k] as any).config)) ===
            JSON.stringify(
              ordered(scenes[data.name.toLowerCase()].virtuals[dev].config)
            )
        )

      const userPresets =
        user_presets[effectId] &&
        Object.keys(user_presets[effectId])
          .map(
            (k) =>
              JSON.stringify(
                ordered((user_presets[effectId][k] as any).config)
              ) ===
                JSON.stringify(
                  ordered(scenes[data.name.toLowerCase()].virtuals[dev].config)
                ) && k
          )
          .filter((n) => !!n)
      const userPreset =
        userPresets && userPresets.length === 1 && userPresets[0]

      return ledfxPreset || userPreset ? (
        <Select
          defaultValue={ledfxPreset || userPreset}
          onChange={(e) =>
            e.target.value &&
            activatePreset(
              dev,
              'default_presets',
              scenes[data.name.toLowerCase()].virtuals[dev].type,
              e.target.value
            ).then(() => getVirtuals())
          }
          disabled={scVirtualsToIgnore.indexOf(dev) > -1}
          disableUnderline
          sx={{
            textDecoration:
              scVirtualsToIgnore.indexOf(dev) > -1 ? 'line-through' : '',
          }}
        >
          {ledfx_presets && <ListSubheader>LedFx Presets</ListSubheader>}
          {ledfx_presets &&
            Object.keys(ledfx_presets)
              .sort((k) => (k === 'reset' ? -1 : 1))
              .map((ke, i) => (
                <MenuItem key={ke + i} value={ke}>
                  {ke === 'reset' ? 'Default' : ke}
                </MenuItem>
              ))}
          {user_presets && <ListSubheader>User Presets</ListSubheader>}
          {user_presets &&
            user_presets[effectId] &&
            Object.keys(user_presets[effectId]).map((ke, i) => (
              <MenuItem key={ke + i} value={ke}>
                {ke}
              </MenuItem>
            ))}
        </Select>
      ) : (
        <Select value="Not saved as Preset" disableUnderline>
          <MenuItem value="Not saved as Preset">Not saved as Preset</MenuItem>
        </Select>
      )
    }
    return <></>
  }
  const renderEffects = (effect: string, dev: string) => {
    return (
      effects && (
        <Select
          defaultValue={effect}
          onChange={(e) => setVirtualEffect(dev, e.target.value, {}, true)}
          disabled={scVirtualsToIgnore.indexOf(dev) > -1}
          disableUnderline
          sx={{
            textDecoration:
              scVirtualsToIgnore.indexOf(dev) > -1 ? 'line-through' : '',
          }}
        >
          {Object.keys(effects).map((ke, i) => (
            <MenuItem key={ke + i} value={ke}>
              {ke}
            </MenuItem>
          ))}
        </Select>
      )
    )
  }

  return (
    <Dialog
      fullScreen={!!data}
      open={open}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
    >
      <AppBar
        enableColorOnDark
        // className={classes.appBar}
      >
        <Toolbar>
          <Button
            autoFocus
            color="primary"
            variant="contained"
            startIcon={<NavigateBefore />}
            onClick={handleClose}
            style={{ marginRight: '1rem' }}
          >
            back
          </Button>
          <Typography
            variant="h6"
            // className={classes.title}
          >
            Edit Scene: {name}
          </Typography>
        </Toolbar>
      </AppBar>
      <DialogTitle id="form-dialog-title">Edit Scene</DialogTitle>
      <DialogContent>
        {!data && (
          <>
            Image is optional and can be one of:
            <ul style={{ paddingLeft: '1rem' }}>
              <li>
                iconName{' '}
                <Link
                  href="https://material-ui.com/components/material-icons/"
                  target="_blank"
                >
                  Find MUI icons here
                </Link>
                <Typography color="textSecondary" variant="subtitle1">
                  <em>eg. flare, AccessAlarms</em>
                </Typography>
              </li>
              <li>
                mdi:icon-name{' '}
                <Link href="https://materialdesignicons.com" target="_blank">
                  Find Material Design icons here
                </Link>
                <Typography color="textSecondary" variant="subtitle1">
                  <em>eg. mdi:balloon, mdi:led-strip-variant</em>
                </Typography>
              </li>
              <li>
                image:custom-url
                <Typography
                  color="textSecondary"
                  variant="subtitle1"
                  style={{ wordBreak: 'break-all' }}
                >
                  <em>
                    eg.
                    image:https://i.ytimg.com/vi/4G2unzNoOnY/maxresdefault.jpg
                  </em>
                </Typography>
              </li>
            </ul>
          </>
        )}
        <div style={{ display: 'flex', margin: '0 auto', maxWidth: '960px' }}>
          <div style={{ flexGrow: 1, paddingRight: '2rem' }}>
            <TextField
              sx={{ mt: data ? '2rem' : '' }}
              autoFocus
              margin="dense"
              id="name"
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled
              required
              fullWidth
            />
            <TextField
              margin="dense"
              id="scene_image"
              label="Image"
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              fullWidth
            />
            {features.scenechips && (
              <TextField
                margin="dense"
                id="scene_tags"
                label="Tags"
                type="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                fullWidth
              />
            )}
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignmentBaseline: 'central',
            }}
          >
            {sceneImage(image || 'Wallpaper')}
            {scenes && Object.keys(scenes).length && features.scenechips ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  maxWidth: '344px',
                  width: '100%',
                }}
              >
                {tags.split(',').map((t: string) => {
                  return (
                    <Chip
                      variant={
                        sceneActiveTags.includes(t) ? 'filled' : 'outlined'
                      }
                      sx={{
                        flexGrow: 0,
                        minWidth: 50,
                        ml: 1,
                        mt: 1,
                        mr: 1,
                        cursor: sceneActiveTags.includes(t)
                          ? 'zoom-out'
                          : 'zoom-in',
                      }}
                      key={t}
                      label={t}
                      onClick={() => toggletSceneActiveTag(t)}
                    />
                  )
                })}
              </div>
            ) : null}
          </div>
        </div>
        {features.sceneexternal ? (
          <div style={{ display: 'flex', margin: '0 auto', maxWidth: '960px' }}>
            <TextField
              margin="dense"
              id="url"
              label="Url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              fullWidth
              error={invalid}
              helperText={invalid && 'Enter valid URL!'}
              onBlur={(e) => {
                setInvalid(!isValidURL(e.target.value))
              }}
            />
            <TextField
              margin="dense"
              id="payload"
              label="Payload"
              type="text"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              fullWidth
            />
          </div>
        ) : (
          <></>
        )}
        <Divider sx={{ margin: '2rem auto 0', maxWidth: '960px' }} />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontVariant: 'all-small-caps',
            textAlign: 'right',
            margin: '0 auto',
            maxWidth: '960px',
          }}
        >
          <span>Device</span>
          <span style={{ flexGrow: 1, textAlign: 'right' }}>Effect</span>
          <div style={{ marginRight: '4rem', width: 180 }}>
            <span style={{ width: 180 }}>Preset</span>
          </div>
        </div>
        <Divider sx={{ margin: '0 auto', maxWidth: '960px' }} />
        {data &&
          scenes &&
          scenes[data.name.toLowerCase()] &&
          Object.keys(scenes[data.name.toLowerCase()].virtuals)
            .filter((d) => !!scenes[data.name.toLowerCase()].virtuals[d].type)
            .map((dev, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontVariant: 'all-small-caps',
                  margin: '0 auto',
                  maxWidth: '960px',
                  color:
                    scVirtualsToIgnore.indexOf(dev) > -1
                      ? theme.palette.text.disabled
                      : '',
                  textDecoration:
                    scVirtualsToIgnore.indexOf(dev) > -1 ? 'line-through' : '',
                }}
              >
                <span>{dev}</span>
                <span
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  {renderEffects(
                    scenes[data.name.toLowerCase()].virtuals[dev].type,
                    dev
                  )}
                  <span style={{ width: 180, textAlign: 'right' }}>
                    {lp &&
                      renderPresets(
                        lp[scenes[data.name.toLowerCase()].virtuals[dev].type],
                        dev,
                        scenes[data.name.toLowerCase()].virtuals[dev].type
                      )}
                  </span>
                  <Box
                    sx={{ ml: 2, cursor: 'pointer' }}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                    onClick={() => {
                      setScVirtualsToIgnore((p) => {
                        return p.indexOf(dev) > -1
                          ? [...p.filter((v) => v !== dev)]
                          : [...p, dev]
                      })
                    }}
                  >
                    {scVirtualsToIgnore.indexOf(dev) > -1 ? (
                      <Undo />
                    ) : (
                      <Clear />
                    )}
                  </Box>
                </span>
              </div>
            ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleAddScene}>Reset to match current</Button>
        <Button onClick={handleAddSceneWithVirtuals}>Apply Changes</Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditSceneDialog
