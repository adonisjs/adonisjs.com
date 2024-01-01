import edge from 'edge.js'
import dayjs from 'dayjs'
import edgeUiKit from 'edge-uikit'
import { icons as uiwIcons } from '@iconify-json/uiw'
import { edgeIconify, addCollection } from 'edge-iconify'
import { icons as tablerIcons } from '@iconify-json/tabler'

addCollection(uiwIcons)
addCollection(tablerIcons)

edge.use(edgeUiKit)
edge.use(edgeIconify)
edge.global('dayjs', dayjs)
