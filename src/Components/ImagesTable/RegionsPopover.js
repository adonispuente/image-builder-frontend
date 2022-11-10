import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Button, Popover } from '@patternfly/react-core';
import { useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { selectComposeById, selectImagesById } from '../../store/composesSlice';

export const selectRegions = createSelector(
  [selectComposeById, selectImagesById],
  (compose, images) => {
    const filteredImages = images.filter(
      (image) =>
        compose.share_with_accounts &&
        compose.share_with_accounts[0] === image.share_with_accounts[0]
    );

    let regions = {};
    filteredImages.forEach((image) => {
      if (image.region && image.status === 'success') {
        if (regions[image.region]) {
          new Date(image.created_at) <
          new Date(regions[image.region].created_at)
            ? null
            : (regions[image.region] = {
                ami: image.ami,
                created_at: image.created_at,
              });
        } else {
          regions[image.region] = {
            ami: image.ami,
            created_at: image.created_at,
          };
        }
      }
    });

    return regions;
  }
);

const ImageLinkRegion = ({ region, ami }) => {
  const url =
    'https://console.aws.amazon.com/ec2/v2/home?region=' +
    region +
    '#LaunchInstanceWizard:ami=' +
    ami;

  return (
    <Button component="a" target="_blank" variant="link" isInline href={url}>
      {region}
    </Button>
  );
};

export const RegionsPopover = ({ composeId }) => {
  const regions = useSelector((state) => selectRegions(state, composeId));

  const listItems = useMemo(() => {
    let listItems = [];
    for (const [key, value] of Object.entries(regions).sort()) {
      listItems.push(
        <li key={key}>
          <ImageLinkRegion region={key} ami={value.ami} />
        </li>
      );
    }
    return listItems;
  }, [regions]);

  return (
    <Popover
      aria-label="Launch instance"
      headerContent={<div>Launch instance</div>}
      bodyContent={<ul>{listItems}</ul>}
    >
      <Button variant="link" isInline>
        Launch
      </Button>
    </Popover>
  );
};

ImageLinkRegion.propTypes = {
  region: PropTypes.string,
  ami: PropTypes.string,
};

RegionsPopover.propTypes = {
  composeId: PropTypes.string,
};