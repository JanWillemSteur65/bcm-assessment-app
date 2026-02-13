import React from 'react';
import {
  Header, HeaderName, HeaderGlobalBar, HeaderGlobalAction,
  SideNav, SideNavItems, SideNavLink, Content
} from '@carbon/react';
import { Settings, Logout, Sun, Moon, Home, Document } from '@carbon/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Shell({ children, onLogout, onToggleTheme, theme }) {
  const nav = useNavigate();
  const loc = useLocation();

  return (
    <div>
      <Header aria-label="BCM Assessment">
        <HeaderName href="#" prefix="IBM" onClick={(e)=>{e.preventDefault(); nav('/');}}>
          BCM Assessment
        </HeaderName>
        <HeaderGlobalBar>
          <HeaderGlobalAction aria-label="Toggle theme" onClick={onToggleTheme}>
            {theme === 'g100' ? <Sun size={20}/> : <Moon size={20}/>}
          </HeaderGlobalAction>
          <HeaderGlobalAction aria-label="Settings" onClick={()=>nav('/settings')}>
            <Settings size={20}/>
          </HeaderGlobalAction>
          <HeaderGlobalAction aria-label="Logout" onClick={onLogout}>
            <Logout size={20}/>
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>

      <SideNav aria-label="Side navigation" expanded isPersistent>
        <SideNavItems>
          <SideNavLink isActive={loc.pathname === '/'} renderIcon={Home} onClick={()=>nav('/')}>
            Home
          </SideNavLink>
          <SideNavLink renderIcon={Document} onClick={()=>nav('/')}>
            Assessments
          </SideNavLink>
        </SideNavItems>
      </SideNav>

      <Content style={{ marginLeft: 256, paddingTop: 48 }}>
        {children}
      </Content>
    </div>
  );
}
