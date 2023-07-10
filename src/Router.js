import React, { Suspense, lazy, useEffect, useState } from 'react';

import { Bullseye, Spinner } from '@patternfly/react-core';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import { useFlag } from '@unleash/proxy-client-react';
import axios from 'axios';
import { Route, Routes } from 'react-router-dom';

import EdgeImageDetail from './Components/edge/ImageDetails';
import ShareImageModal from './Components/ShareImageModal/ShareImageModal';
import { manageEdgeImagesUrlName } from './Utilities/edge';

const LandingPage = lazy(() => import('./Components/LandingPage/LandingPage'));
const CreateImageWizard = lazy(() =>
  import('./Components/CreateImageWizard/CreateImageWizard')
);
const INVENTORY_TOTAL_FETCH_URL = '/api/inventory/v1/hosts';

export const Router = () => {
  const [hasSystems, setHasSystems] = useState(true);

  useEffect(() => {
    try {
      axios
        .get(`${INVENTORY_TOTAL_FETCH_URL}?page=1&per_page=1`)
        .then(({ data }) => {
          setHasSystems(data.total > 0);
        });
    } catch (e) {
      /*eslint-disable no-console*/
      console.log(e);
      /*eslint-enable no-console*/
    }
  }, [hasSystems]);

  const edgeParityFlag = useFlag('edgeParity.image-list');
  return (
    <Suspense
      fallback={
        <Bullseye>
          <Spinner size="xl" />
        </Bullseye>
      }
    >
      {!hasSystems ? (
        <AsyncComponent
          appName="dashboard"
          module="./AppZeroState"
          scope="dashboard"
          ErrorComponent={<ErrorState />}
          app="Images"
        />
      ) : (
        <Routes>
          <Route path="*" element={<LandingPage />}>
            <Route
              path="imagewizard/:composeId?"
              element={<CreateImageWizard />}
            />
            <Route path="share/:composeId" element={<ShareImageModal />} />
          </Route>

          {edgeParityFlag && (
            <Route
              path={`/${manageEdgeImagesUrlName}/:imageId`}
              element={<EdgeImageDetail />}
            >
              <Route path="*" element={<EdgeImageDetail />} />
              <Route
                path={`versions/:imageVersionId/*`}
                element={<EdgeImageDetail />}
              />
            </Route>
          )}
        </Routes>
      )}
    </Suspense>
  );
};
