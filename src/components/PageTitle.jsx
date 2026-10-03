import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { titleForPath } from '../data/toolCatalogue';

/** The only writer of document.title; mounted once beside the router. */
export const PageTitle = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = titleForPath(pathname);
  }, [pathname]);

  return null;
};
