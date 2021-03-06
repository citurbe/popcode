/* eslint-disable react/no-multi-comp */

import classnames from 'classnames';
import {connect} from 'react-redux';
import constant from 'lodash/constant';
import onClickOutside from 'react-onclickoutside';
import preventClickthrough from 'react-prevent-clickthrough';
import property from 'lodash/property';
import PropTypes from 'prop-types';
import React from 'react';
import {closeTopBarMenu, toggleTopBarMenu} from '../../actions';
import {getOpenTopBarMenu} from '../../selectors';

export function MenuItem({children, isEnabled, onClick}) {
  return (
    <div
      className={classnames('top-bar__menu-item',
        {'top-bar__menu-item_active': isEnabled},
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

MenuItem.propTypes = {
  children: PropTypes.node.isRequired,
  isEnabled: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

MenuItem.defaultProps = {
  isEnabled: false,
};

export default function createMenu({
  isVisible = constant(true),
  renderItems,
  name,
}) {
  function mapStateToProps(state) {
    const isOpen = getOpenTopBarMenu(state) === name;
    return {
      isOpen,
      disableOnClickOutside: !isOpen,
    };
  }

  function mapDispatchToProps(dispatch) {
    return {
      onClose() {
        dispatch(closeTopBarMenu(name));
      },

      onToggle() {
        dispatch(toggleTopBarMenu(name));
      },
    };
  }

  return function createMenuWithMappedProps(MenuLaunchButton) {
    function Menu(props) {
      if (!isVisible(props)) {
        return null;
      }

      const {isOpen, onToggle} = props;
      const menu = isOpen ?
        (
          <div
            className="top-bar__menu"
            onClick={preventClickthrough}
          >
            {renderItems(props)}
          </div>
        ) : null;

      return (
        <div
          className={classnames(
            'top-bar__menu-button',
            {'top-bar__menu-button_active': isOpen},
          )}
          onClick={onToggle}
        >
          <MenuLaunchButton {...props} />
          {menu}
        </div>
      );
    }

    Menu.displayName = `Menu(${name})`;

    Menu.propTypes = {
      isOpen: PropTypes.bool.isRequired,
      onToggle: PropTypes.func.isRequired,
    };

    return connect(mapStateToProps, mapDispatchToProps)(
      onClickOutside(
        Menu,
        {handleClickOutside: property('props.onClose')},
      ),
    );
  };
}
