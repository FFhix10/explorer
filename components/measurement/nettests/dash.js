
import React from 'react'
import PropTypes from 'prop-types'
import {
  Heading,
  Flex,
  Box,
  theme
} from 'ooni-components'

import { Text } from 'rebass'

import {
  VictoryChart,
  VictoryLine,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from 'victory'

import MdFlashOn from 'react-icons/lib/md/flash-on'

const InfoBoxItem = ({
  label,
  content,
  unit
}) => (
  <Box>
    <Text fontSize={24}>
      {content} <Text is='small'>{unit}</Text>
    </Text>
    <Text fontWeight='bold' fontSize={16} >
      {label}
    </Text>
  </Box>
)

/*
 * This table is derived from:
 * https://support.google.com/youtube/answer/1722171?hl=en-GB
 */
const minimumBitrateForVideo = [
  {
    'sfr_min_bitrate': 600,
    'hfr_min_bitrate': 1000,
    'type': '240p'
  },
  {
    'sfr_min_bitrate': 1000,
    'hfr_min_bitrate': 1500,
    'type': '360p'
  },
  {
    'sfr_min_bitrate': 2500,
    'hfr_min_bitrate': 4000,
    'type': '480p'
  },
  {
    'sfr_min_bitrate': 5000,
    'hfr_min_bitrate': 7500,
    'type': '720p (HD)'
  },
  {
    'sfr_min_bitrate': 8000,
    'hfr_min_bitrate': 12000,
    'type': '1080p (full HD)'
  },
  {
    'sfr_min_bitrate': 16000,
    'hfr_min_bitrate': 24000,
    'type': '1440p (2k)'
  },
  {
    'sfr_min_bitrate': 35000,
    'hfr_min_bitrate': 53000,
    'type': '2160p (4k)'
  }
]

const getOptimalQualityForBitrate = (testKeys) => {
  let optimalQuality = minimumBitrateForVideo[0]
  minimumBitrateForVideo.forEach((rate) => {
    // Note: we use SFR rather than HFR because SFR is more common
    if (testKeys.simple.median_bitrate >= rate['sfr_min_bitrate']) {
      optimalQuality = rate
    }
  })
  return optimalQuality
}

const DashDetails = ({ measurement, render }) => {
  const testKeys = measurement.test_keys
  // const isFailed = testKeys.failure !== null
  // const failure = testKeys.failure
  const optimalVideoRate = getOptimalQualityForBitrate(testKeys).type
  const medianBitrate = (testKeys.simple.median_bitrate / 1000).toFixed(2)
  const playoutDelay = (testKeys.simple.min_playout_delay).toFixed(2)

  // construct data for graph
  const clientData = testKeys.receiver_data
  const data = clientData.map(iteration => ({
    x: iteration.iteration,
    y: iteration.rate / 1000,
  }))

  return (
    render({
      statusIcon: <MdFlashOn />,
      statusLabel: 'Results',
      statusInfo: (
        <Box width={1}>
          <Flex justifyContent='space-around'>
            <InfoBoxItem label='Video Quality' content={optimalVideoRate}/>
            <InfoBoxItem label='Median Bitrate' content={medianBitrate} unit='Mbit/s' />
            <InfoBoxItem label='Playout Delay' content={playoutDelay} unit='s' />
          </Flex>
        </Box>
      ),
      details: (
        <Flex>
          <Box p={3}>
            <Heading h={4}> Video Quality by time </Heading>
            <Box>
              <VictoryChart
                containerComponent={
                  <VictoryVoronoiContainer voronoiDimension="x"
                    labels={(d) => `${d.y} Mb/s`}
                    labelComponent={<VictoryTooltip
                      cornerRadius={0}
                      flyoutStyle={{fill: 'WHITE'}}
                    />}
                  />
                }
              >
                <VictoryLine
                  style={{
                    data: { stroke: theme.colors.base }
                  }}
                  data={data}
                  animate={{
                    duration: 2000,
                    onLoad: { duration: 1000 }
                  }}


                />
              </VictoryChart>
            </Box>
          </Box>
        </Flex>
      )
    })
  )
}

DashDetails.propTypes = {
  testKeys: PropTypes.object
}

export default DashDetails
