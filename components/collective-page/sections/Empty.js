import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

import { Dimensions } from '../_constants';
import Container from '../../Container';
import { Box, Flex } from '../../Grid';
import Link from '../../Link';
import StyledButton from '../../StyledButton';
import { P } from '../../Text';
import ContainerSectionContent from '../ContainerSectionContent';

const OutlineContainer = styled(Container)`
  background: #ffffff;
  border: 1px solid #dcdee0;
  box-shadow: 0px 1px 4px 1px rgba(49, 50, 51, 0.1);
  border-radius: 12px;
`;

const Illustration = styled.img`
  width: 248px;
  height: 248px;
`;

import EmptyCollectivePageIllustration from '../../../public/static/images/collective-navigation/EmptyCollectivePageIllustration.png';

const SectionEmpty = props => {
  const { collective } = props;

  return (
    <Box py={5}>
      <ContainerSectionContent>
        <OutlineContainer
          display="flex"
          flexDirection={['column', 'row']}
          maxWidth={Dimensions.MAX_SECTION_WIDTH}
          py={4}
          px={[3, 4, 6]}
        >
          <Flex alignItems="center" justifyContent="center">
            <Illustration src={EmptyCollectivePageIllustration} alt="Empty jars illustration" />
          </Flex>
          <Flex
            flexDirection="column"
            ml={[0, 4, 5]}
            mt={[2, 0]}
            py={[0, 3]}
            justifyContent="space-around"
            alignItems={['center', 'flex-start']}
          >
            <P fontSize="20px" color="black.600" lineHeight="28px">
              <FormattedMessage
                id="EmptyCollectivePage"
                defaultMessage="{collective} is now working on its public profile, and don't have anything to show, yet. Meanwhile, there are dozens of Collectives you can discover, take a look!"
                values={{
                  collective: collective.name,
                }}
              />
            </P>
            <Link route="discover">
              <StyledButton mt={[4, 3]} buttonStyle="primary" buttonSize="medium" fontSize="14px" lineHeight="16px">
                <FormattedMessage id="DiscoverCollectives" defaultMessage="Discover collectives" /> →
              </StyledButton>
            </Link>
          </Flex>
        </OutlineContainer>
      </ContainerSectionContent>
    </Box>
  );
};

SectionEmpty.propTypes = {
  /** Collective */
  collective: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default SectionEmpty;
