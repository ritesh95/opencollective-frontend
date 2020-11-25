import React, { Fragment } from 'react';
import { PropTypes } from 'prop-types';
import { DotsVerticalRounded } from '@styled-icons/boxicons-regular/DotsVerticalRounded';
import { Settings } from '@styled-icons/feather/Settings';
import themeGet from '@styled-system/theme-get';
import { FormattedMessage, injectIntl } from 'react-intl';
import styled, { css } from 'styled-components';

import { getFilteredSectionsForCollective } from '../lib/collective-sections';
import { CollectiveType } from '../lib/constants/collectives';
import { getEnvVar } from '../lib/env-utils';
import i18nCollectivePageSection from '../lib/i18n-collective-page-section';
import { parseToBoolean } from '../lib/utils';

import { AllSectionsNames, Dimensions } from './collective-page/_constants';
import Avatar from './Avatar';
import CollectiveCallsToAction from './CollectiveCallsToAction';
import CollectiveNavbarActionsMenu from './CollectiveNavbarActionsMenu';
import Container from './Container';
import { Box, Flex } from './Grid';
import Link from './Link';
import LinkCollective from './LinkCollective';
import LoadingPlaceholder from './LoadingPlaceholder';
import StyledRoundButton from './StyledRoundButton';
import { P } from './Text';

import aboutNavbarIcon from '../public/static/images/collective-navigation/CollectiveNavbarIconAbout.png';
import budgetNavbarIcon from '../public/static/images/collective-navigation/CollectiveNavbarIconBudget.png';
import connectNavbarIcon from '../public/static/images/collective-navigation/CollectiveNavbarIconConnect.png';
import contributeNavbarIcon from '../public/static/images/collective-navigation/CollectiveNavbarIconContribute.png';
import eventsNavbarIcon from '../public/static/images/collective-navigation/CollectiveNavbarIconEvents.png';

/** Main container for the entire component */
const MainContainer = styled.div`
  background: white;
  box-shadow: 0px 6px 10px -5px rgba(214, 214, 214, 0.5);

  /** Everything's inside cannot be larger than max section width */
  & > * {
    max-width: ${Dimensions.MAX_SECTION_WIDTH}px;
    margin: 0 auto;
  }
`;

/** A single menu link */
const MenuLink = styled.a`
  display: block;
  color: #71757a;
  font-size: 14px;
  line-height: 16px;
  text-decoration: none;
  white-space: nowrap;

  letter-spacing: 0.6px;
  text-transform: uppercase;
  font-weight: 200;

  &:focus {
    color: ${themeGet('colors.primary.700')};
    text-decoration: none;
  }

  &:hover {
    color: ${themeGet('colors.primary.400')};
    text-decoration: none;
  }

  @media (max-width: 52em) {
    padding: 16px;
  }
`;

const MenuLinkContainer = styled(Box).attrs({ px: [Dimensions.PADDING_X[1], null, 0] })`
  cursor: pointer;

  &::after {
    content: '';
    display: block;
    width: 0;
    height: 3px;
    background: ${themeGet('colors.primary.500')};
    transition: width 0.2s;
    float: right;
  }

  ${props =>
    props.isSelected &&
    css`
      color: #090a0a;
      font-weight: 500;
      ${MenuLink} {
        color: #090a0a;
      }
      @media (min-width: 52em) {
        &::after {
          width: 100%;
          float: left;
        }
      }
    `}

  ${props =>
    props.mobileOnly &&
    css`
      @media (min-width: 52em) {
        display: none;
      }
    `}

  @media (max-width: 52em) {
    border-top: 1px solid #e1e1e1;
    &::after {
      display: none;
    }
  }
`;

const IconIllustration = styled.img.attrs({ alt: '' })`
  width: 32px;
  height: 32px;
`;

const InfosContainer = styled(Container)`
  padding: 14px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
  transition: opacity 0.075s ease-out, transform 0.1s ease-out, visibility 0.075s ease-out;

  @media (max-width: 52em) {
    padding: 10px 16px;
  }

  /** Hidden state */
  ${props =>
    props.isHidden &&
    css`
      visibility: hidden;
      opacity: 0;
      transform: translateY(-20px);
    `}
`;

/** Displayed on mobile to toggle the menu */
const ExpandMenuIcon = styled(DotsVerticalRounded).attrs({ size: 28 })`
  cursor: pointer;
  margin-right: 4px;
  flex: 0 0 28px;
  color: ${themeGet('colors.black.500')};

  @media (min-width: 52em) {
    display: none;
  }
`;

const BlueSettingsIcon = styled(Settings)`
  color: rgb(48, 76, 220);
`;

const CollectiveName = styled.h1`
  margin: 0 8px;
  padding: 8px 0;
  font-size: 20px;
  line-height: 24px;
  text-align: center;
  letter-spacing: -1px;
  font-weight: bold;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  min-width: 0;

  a:not(:hover) {
    color: #313233;
  }

  @media (min-width: 52em) {
    text-align: center;
  }
`;

const getDefaultCallsToactions = (collective, isAdmin) => {
  if (!collective) {
    return {};
  }

  const isCollective = collective.type === CollectiveType.COLLECTIVE;
  const isEvent = collective.type === CollectiveType.EVENT;
  return {
    hasContact: collective.canContact,
    hasApply: collective.canApply && !isAdmin,
    hasManageSubscriptions: isAdmin && !isCollective && !isEvent,
  };
};

const getCollectiveNavbarIcon = section => {
  switch (section) {
    case 'about':
      return aboutNavbarIcon;
    case 'budget' || 'transactions':
      return budgetNavbarIcon;
    case 'connect':
      return connectNavbarIcon;
    case 'contribute' || 'contributions':
      return contributeNavbarIcon;
    case 'events' || 'projects':
      return eventsNavbarIcon;
    default:
      return contributeNavbarIcon;
  }
};

/**
 * The NavBar that displays all the invidual sections.
 */
const CollectiveNavbar = ({
  collective,
  isAdmin,
  isLoading,
  showEdit,
  sections,
  selected,
  LinkComponent,
  callsToAction,
  onCollectiveClick,
  onSectionClick,
  hideInfos,
  onlyInfos,
  isAnimated,
  createNotification,
  intl,
}) => {
  const [isExpanded, setExpanded] = React.useState(false);
  sections = sections || getFilteredSectionsForCollective(collective, isAdmin);
  callsToAction = { ...getDefaultCallsToactions(collective, isAdmin), ...callsToAction };
  const isEvent = collective.type === CollectiveType.EVENT;

  return (
    <MainContainer>
      {/** Collective infos */}
      <InfosContainer isHidden={hideInfos} isAnimated={isAnimated}>
        <Flex alignItems="center" flex="1 1 80%" css={{ minWidth: 0 /** For text-overflow */ }}>
          <LinkCollective collective={collective} onClick={onCollectiveClick}>
            <Container borderRadius="25%" mr={2}>
              <Avatar collective={collective} radius={40} />
            </Container>
          </LinkCollective>
          <CollectiveName>
            {isLoading ? (
              <LoadingPlaceholder height={22} minWidth={100} />
            ) : (
              <LinkCollective collective={collective} onClick={onCollectiveClick} />
            )}
          </CollectiveName>
          {isAdmin && showEdit && (
            <Link route="editCollective" params={{ slug: collective.slug }} title="Settings">
              <StyledRoundButton size={24} bg="#F0F2F5" color="#4B4E52">
                <Settings size={17} />
              </StyledRoundButton>
            </Link>
          )}
        </Flex>
        {!onlyInfos && <ExpandMenuIcon onClick={() => setExpanded(!isExpanded)} />}
      </InfosContainer>

      {/** Navbar items and buttons */}
      {!onlyInfos && (
        <Container
          position={['absolute', 'relative']}
          display="flex"
          justifyContent={['space-evenly', null, 'space-between']}
          px={[0, 0, Dimensions.PADDING_X[1]]}
          width="100%"
          background="white"
          flexDirection={['column', null, 'row']}
        >
          {isLoading ? (
            <LoadingPlaceholder height={43} minWidth={150} mb={2} />
          ) : (
            <Container
              flex="2 0"
              css={{ overflowX: 'auto' }}
              display={isExpanded ? 'flex' : ['none', null, 'flex']}
              data-cy="CollectivePage.NavBar"
              flexDirection={['column', null, 'row']}
              height="100%"
              borderBottom={['1px solid #e6e8eb', 'none']}
              backgroundColor="#fff"
              zIndex={1}
            >
              {sections.map(section => (
                <MenuLinkContainer
                  key={section}
                  isSelected={section === selected}
                  onClick={() => {
                    if (isExpanded) {
                      setExpanded(false);
                    }
                    if (onSectionClick) {
                      onSectionClick(section);
                    }
                  }}
                >
                  <Flex py={3} mx={3}>
                    <Flex flexGrow={1} alignItems="center">
                      <IconIllustration src={getCollectiveNavbarIcon(section)} />
                    </Flex>
                    <Flex flexGrow={1} alignItems="center" ml={2}>
                      <MenuLink
                        as={LinkComponent}
                        collectivePath={collective.path || `/${collective.slug}`}
                        section={section}
                        label={i18nCollectivePageSection(intl, section)}
                      />
                    </Flex>
                  </Flex>
                </MenuLinkContainer>
              ))}
              {!parseToBoolean(getEnvVar('NEW_COLLECTIVE_NAVBAR')) && (
                <Fragment>
                  {/* mobile CTAs */}
                  {callsToAction.hasSubmitExpense && (
                    <MenuLinkContainer mobileOnly>
                      <MenuLink as={Link} route="create-expense" params={{ collectiveSlug: collective.slug }}>
                        <FormattedMessage id="menu.submitExpense" defaultMessage="Submit Expense" />
                      </MenuLink>
                    </MenuLinkContainer>
                  )}
                  {callsToAction.hasContact && (
                    <MenuLinkContainer mobileOnly>
                      <MenuLink as={Link} route="collective-contact" params={{ collectiveSlug: collective.slug }}>
                        <FormattedMessage id="Contact" defaultMessage="Contact" />
                      </MenuLink>
                    </MenuLinkContainer>
                  )}
                  {callsToAction.hasDashboard && collective.plan.hostDashboard && (
                    <MenuLinkContainer mobileOnly>
                      <MenuLink as={Link} route="host.dashboard" params={{ hostCollectiveSlug: collective.slug }}>
                        <FormattedMessage id="host.dashboard" defaultMessage="Dashboard" />
                      </MenuLink>
                    </MenuLinkContainer>
                  )}
                </Fragment>
              )}
            </Container>
          )}
          {!parseToBoolean(getEnvVar('NEW_COLLECTIVE_NAVBAR')) && (
            <div>
              {!isLoading && (
                // non-mobile CTAs
                <CollectiveCallsToAction
                  display={['none', null, 'flex']}
                  collective={collective}
                  callsToAction={callsToAction}
                />
              )}
            </div>
          )}
          {/* CTAs for v2 navbar & admin panel */}
          {parseToBoolean(getEnvVar('NEW_COLLECTIVE_NAVBAR')) && (
            <Container
              display={['none', null, 'flex']}
              flexDirection={['column', null, 'row']}
              flex="1 1 fit-content"
              backgroundColor="#fff"
              zIndex={1}
            >
              {isAdmin && (
                <Flex mx={2} alignItems="center">
                  <Link
                    route={isEvent ? 'editEvent' : 'editCollective'}
                    params={
                      isEvent
                        ? { parentCollectiveSlug: collective.parentCollective?.slug, eventSlug: collective.slug }
                        : { slug: collective.slug }
                    }
                  >
                    <Container
                      display="flex"
                      flexGrow={1}
                      alignItems="center"
                      borderRadius={8}
                      background="rgba(72, 95, 211, 0.1)"
                      px={3}
                      py={1}
                    >
                      <BlueSettingsIcon size={20} />
                      <P
                        ml={1}
                        textTransform="uppercase"
                        color="rgb(48, 76, 220)"
                        fontSize="14px"
                        lineHeight="16px"
                        letterSpacing="60%"
                      >
                        <FormattedMessage id="AdminPanel" defaultMessage="Admin Panel" />
                      </P>
                    </Container>
                  </Link>
                </Flex>
              )}
              {!isLoading && (
                <CollectiveNavbarActionsMenu
                  collective={collective}
                  callsToAction={callsToAction}
                  createNotification={createNotification}
                />
              )}
            </Container>
          )}
        </Container>
      )}
    </MainContainer>
  );
};

CollectiveNavbar.propTypes = {
  /** Collective to show info about */
  collective: PropTypes.shape({
    name: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    path: PropTypes.string,
    isArchived: PropTypes.bool,
    canContact: PropTypes.bool,
    canApply: PropTypes.bool,
    host: PropTypes.object,
    plan: PropTypes.object,
    parentCollective: PropTypes.object,
  }),
  /** Defines the calls to action displayed next to the NavBar items. Match PropTypes of `CollectiveCallsToAction` */
  callsToAction: PropTypes.shape({
    hasContact: PropTypes.bool,
    hasSubmitExpense: PropTypes.bool,
    hasApply: PropTypes.bool,
    hasDashboard: PropTypes.bool,
    hasManageSubscriptions: PropTypes.bool,
  }),
  /** Used to check what sections can be used */
  isAdmin: PropTypes.bool,
  /** Will show loading state */
  isLoading: PropTypes.bool,
  /** Wether we want to display the "/edit" button */
  showEdit: PropTypes.bool,
  /** Called with the new section name when it changes */
  onSectionClick: PropTypes.func,
  /** An optionnal function to build links URLs. Useful to override behaviour in test/styleguide envs. */
  LinkComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  /** The list of sections to be displayed by the NavBar. If not provided, will show all the sections available to this collective type. */
  sections: PropTypes.arrayOf(PropTypes.oneOf(AllSectionsNames)),
  /** Called when users click the collective logo or name */
  onCollectiveClick: PropTypes.func,
  /** Currently selected section */
  selected: PropTypes.oneOf(AllSectionsNames),
  /** If true, the collective infos (avatar + name) will be hidden with css `visibility` */
  hideInfos: PropTypes.bool,
  /** If true, the CTAs will be hidden on mobile */
  hideButtonsOnMobile: PropTypes.bool,
  /** If true, the Navbar items and buttons will be skipped  */
  onlyInfos: PropTypes.bool,
  /** If true, the collective infos will fadeInDown and fadeOutUp when transitioning */
  isAnimated: PropTypes.bool,
  /** Set this to true to make the component smaller in height */
  isSmall: PropTypes.bool,
  /** @ignore From injectIntl */
  intl: PropTypes.object,
  createNotification: PropTypes.func,
};

CollectiveNavbar.defaultProps = {
  hideInfos: false,
  isAnimated: false,
  onlyInfos: false,
  callsToAction: {},
  // eslint-disable-next-line react/prop-types
  LinkComponent: function DefaultNavbarLink({ section, label, collectivePath, className }) {
    return (
      <Link route={`${collectivePath}#section-${section}`} className={className}>
        {label}
      </Link>
    );
  },
};

export default React.memo(injectIntl(CollectiveNavbar));
