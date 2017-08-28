import { h } from 'preact';

const Header = ({ title, children }) =>
  <header class="header">
    <h1>
      {title}
    </h1>
    <nav>
      {children.map(child => child)}
    </nav>
  </header>;

export default Header;
