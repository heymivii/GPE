import { describe, it, expect, beforeEach } from 'vitest';
import tokenStorage from './tokenStorage';

describe('tokenStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('« se souvenir de moi » coché écrit dans localStorage', () => {
    tokenStorage.setSession({ accessToken: 'a', refreshToken: 'r' }, true);

    expect(localStorage.getItem('access_token')).toBe('a');
    expect(localStorage.getItem('refresh_token')).toBe('r');
    expect(sessionStorage.getItem('access_token')).toBeNull();
    expect(tokenStorage.isPersistent()).toBe(true);
  });

  it('« se souvenir de moi » décoché écrit dans sessionStorage', () => {
    tokenStorage.setSession({ accessToken: 'a', refreshToken: 'r' }, false);

    expect(sessionStorage.getItem('access_token')).toBe('a');
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(tokenStorage.isPersistent()).toBe(false);
  });

  it('ouvrir une session non persistante efface la session persistante précédente', () => {
    tokenStorage.setSession({ accessToken: 'vieux', refreshToken: 'vieux-r' }, true);
    tokenStorage.setSession({ accessToken: 'neuf', refreshToken: 'neuf-r' }, false);

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(sessionStorage.getItem('access_token')).toBe('neuf');
  });

  it('ouvrir une session persistante efface la session d’onglet précédente', () => {
    tokenStorage.setSession({ accessToken: 'vieux', refreshToken: 'vieux-r' }, false);
    tokenStorage.setSession({ accessToken: 'neuf', refreshToken: 'neuf-r' }, true);

    expect(sessionStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('access_token')).toBe('neuf');
  });

  it('un refresh ne promeut PAS une session d’onglet en session persistante', () => {
    tokenStorage.setSession({ accessToken: 'a', refreshToken: 'r' }, false);

    tokenStorage.updateTokens({ accessToken: 'a2', refreshToken: 'r2' });

    expect(sessionStorage.getItem('access_token')).toBe('a2');
    expect(sessionStorage.getItem('refresh_token')).toBe('r2');
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(tokenStorage.isPersistent()).toBe(false);
  });

  it('un refresh conserve une session persistante', () => {
    tokenStorage.setSession({ accessToken: 'a', refreshToken: 'r' }, true);

    tokenStorage.updateTokens({ accessToken: 'a2' });

    expect(localStorage.getItem('access_token')).toBe('a2');
    // Le refresh token non renvoyé par le serveur reste inchangé.
    expect(localStorage.getItem('refresh_token')).toBe('r');
    expect(sessionStorage.getItem('access_token')).toBeNull();
  });

  it('les lectures trouvent la session quel que soit le magasin', () => {
    tokenStorage.setSession({ accessToken: 'a', refreshToken: 'r' }, false);
    expect(tokenStorage.getAccessToken()).toBe('a');
    expect(tokenStorage.getRefreshToken()).toBe('r');

    tokenStorage.setSession({ accessToken: 'b', refreshToken: 's' }, true);
    expect(tokenStorage.getAccessToken()).toBe('b');
    expect(tokenStorage.getRefreshToken()).toBe('s');
  });

  it('clear() vide les deux magasins', () => {
    localStorage.setItem('access_token', 'a');
    sessionStorage.setItem('refresh_token', 'r');

    tokenStorage.clear();

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(sessionStorage.getItem('refresh_token')).toBeNull();
    expect(tokenStorage.getAccessToken()).toBeNull();
  });
});
