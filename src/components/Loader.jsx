import { h } from 'preact';

const Loader = ({ isLoading }) =>
  <div class="loader">
    {isLoading &&
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="8"
        height="8"
        viewBox="0 0 8 8"
        class="animate"
      >
        <path d="M4 0c-2.2 0-4 1.8-4 4s1.8 4 4 4c1.1 0 2.12-.43 2.84-1.16l-.72-.72c-.54.54-1.29.88-2.13.88-1.66 0-3-1.34-3-3s1.34-3 3-3c.83 0 1.55.36 2.09.91l-1.09 1.09h3v-3l-1.19 1.19c-.72-.72-1.71-1.19-2.81-1.19z" />
      </svg>}
    {!isLoading &&
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="8"
        height="8"
        viewBox="0 0 8 8"
      >
        <path d="M2 0v5h-2l2.53 3 2.47-3h-2v-5h-1z" transform="translate(1)" />
      </svg>}
  </div>;

export default Loader;
