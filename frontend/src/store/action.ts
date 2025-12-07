import type { History } from 'history';
import type { AxiosInstance, AxiosError } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';

import type { UserAuth, User, Offer, Comment, CommentAuth, FavoriteAuth, UserRegister, NewOffer } from '../types/types';
import type { ApiComment, ApiOffer, ApiUser, LoginResponse } from '../types/api';
import { ApiRoute, AppRoute, HttpCode } from '../const';
import { Token } from '../utils';
import { mapApiComment, mapApiOffer, mapApiUser } from '../utils/api-mappers';

type Extra = {
  api: AxiosInstance;
  history: History;
}

const normalizeImages = (images: string[], previewImage: string): string[] => {
  if (images.length >= 6) {
    return images.slice(0, 6);
  }

  const fallbackImage = previewImage || images[0] || '';
  const filled = [...images];

  while (filled.length < 6) {
    filled.push(fallbackImage);
  }

  return filled;
};

const mapOfferToApiPayload = (offer: NewOffer) => ({
  title: offer.title,
  description: offer.description,
  city: offer.city.name.toLowerCase(),
  previewImage: offer.previewImage,
  images: normalizeImages(offer.images, offer.previewImage),
  isPremium: offer.isPremium,
  rating: offer.rating || 1,
  housingType: offer.type,
  rooms: offer.bedrooms,
  maxGuests: offer.maxAdults,
  price: offer.price,
  comforts: offer.goods,
  location: offer.location,
});

export const Action = {
  FETCH_OFFERS: 'offers/fetch',
  FETCH_OFFER: 'offer/fetch',
  POST_OFFER: 'offer/post-offer',
  EDIT_OFFER: 'offer/edit-offer',
  DELETE_OFFER: 'offer/delete-offer',
  FETCH_FAVORITE_OFFERS: 'offers/fetch-favorite',
  FETCH_PREMIUM_OFFERS: 'offers/fetch-premium',
  FETCH_COMMENTS: 'offer/fetch-comments',
  POST_COMMENT: 'offer/post-comment',
  POST_FAVORITE: 'offer/post-favorite',
  LOGIN_USER: 'user/login',
  LOGOUT_USER: 'user/logout',
  FETCH_USER_STATUS: 'user/fetch-status',
  REGISTER_USER: 'user/register'
};

export const fetchOffers = createAsyncThunk<Offer[], undefined, { extra: Extra }>(
  Action.FETCH_OFFERS,
  async (_, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<ApiOffer[]>(ApiRoute.Offers);

    return data.map(mapApiOffer);
  });

export const fetchFavoriteOffers = createAsyncThunk<Offer[], undefined, { extra: Extra }>(
  Action.FETCH_FAVORITE_OFFERS,
  async (_, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<ApiOffer[]>(ApiRoute.Favorite);

    return data.map(mapApiOffer);
  });

export const fetchOffer = createAsyncThunk<Offer, Offer['id'], { extra: Extra }>(
  Action.FETCH_OFFER,
  async (id, { extra }) => {
    const { api, history } = extra;

    try {
      const { data } = await api.get<ApiOffer>(`${ApiRoute.Offers}/${id}`);

      return mapApiOffer(data);
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === HttpCode.NotFound) {
        history.push(AppRoute.NotFound);
      }

      return Promise.reject(error);
    }
  });

export const postOffer = createAsyncThunk<void, NewOffer, { extra: Extra }>(
  Action.POST_OFFER,
  async (newOffer, { extra }) => {
    const { api, history } = extra;
    const payload = mapOfferToApiPayload(newOffer);
    const { data } = await api.post<ApiOffer>(ApiRoute.Offers, payload);
    history.push(`${AppRoute.Property}/${data.id}`);
  });

export const editOffer = createAsyncThunk<void, Offer, { extra: Extra }>(
  Action.EDIT_OFFER,
  async (offer, { extra }) => {
    const { api, history } = extra;
    const payload = mapOfferToApiPayload(offer);
    const { data } = await api.patch<ApiOffer>(`${ApiRoute.Offers}/${offer.id}`, payload);
    history.push(`${AppRoute.Property}/${data.id}`);
  });

export const deleteOffer = createAsyncThunk<void, string, { extra: Extra }>(
  Action.DELETE_OFFER,
  async (id, { extra }) => {
    const { api, history } = extra;
    await api.delete(`${ApiRoute.Offers}/${id}`);
    history.push(AppRoute.Root);
  });

export const fetchPremiumOffers = createAsyncThunk<Offer[], string, { extra: Extra }>(
  Action.FETCH_PREMIUM_OFFERS,
  async (cityName, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<ApiOffer[]>(`${ApiRoute.Premium}/${cityName.toLowerCase()}`);

    return data.map(mapApiOffer);
  });

export const fetchComments = createAsyncThunk<Comment[], Offer['id'], { extra: Extra }>(
  Action.FETCH_COMMENTS,
  async (id, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<ApiComment[]>(`${ApiRoute.Comments}/${id}/comments`);

    return data.map(mapApiComment);
  });

export const fetchUserStatus = createAsyncThunk<UserAuth['email'], undefined, { extra: Extra }>(
  Action.FETCH_USER_STATUS,
  async (_, { extra }) => {
    const { api } = extra;

    try {
      const { data } = await api.get<ApiUser>(ApiRoute.Check);
      const user = mapApiUser(data);

      return user.email;
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === HttpCode.NoAuth) {
        Token.drop();
      }

      return Promise.reject(error);
    }
  });

export const loginUser = createAsyncThunk<UserAuth['email'], UserAuth, { extra: Extra }>(
  Action.LOGIN_USER,
  async ({ email, password }, { extra }) => {
    const { api, history } = extra;
    const { data } = await api.post<LoginResponse>(ApiRoute.Login, { email, password });
    Token.save(data.token);
    const { data: userData } = await api.get<ApiUser>(ApiRoute.Check);
    const user = mapApiUser(userData);
    history.push(AppRoute.Root);

    return user.email;
  });

export const logoutUser = createAsyncThunk<void, undefined, { extra: Extra }>(
  Action.LOGOUT_USER,
  async () => {
    Token.drop();
  });

export const registerUser = createAsyncThunk<UserAuth['email'], UserRegister, { extra: Extra }>(
  Action.REGISTER_USER,
  async ({ email, password, name, isPro, avatar }, { extra }) => {
    const { api, history } = extra;
    await api.post(ApiRoute.Register, { email, password, name, type: isPro ? 'pro' : 'normal' });

    const { data: loginData } = await api.post<LoginResponse>(ApiRoute.Login, { email, password });
    Token.save(loginData.token);

    if (avatar) {
      const payload = new FormData();
      payload.append('avatar', avatar);
      await api.post(ApiRoute.Avatar, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }

    history.push(AppRoute.Root);
    return email;
  });


export const postComment = createAsyncThunk<Comment[], CommentAuth, { extra: Extra }>(
  Action.POST_COMMENT,
  async ({ id, comment, rating }, { extra }) => {
    const { api } = extra;
    await api.post<ApiComment>(`${ApiRoute.Comments}/${id}/comments`, { text: comment, rating });
    const { data } = await api.get<ApiComment[]>(`${ApiRoute.Comments}/${id}/comments`);

    return data.map(mapApiComment);
  });

export const postFavorite = createAsyncThunk<Offer, FavoriteAuth, { extra: Extra }>(
  Action.POST_FAVORITE,
  async ({ id, status }, { extra }) => {
    const { api, history } = extra;

    try {
      if (status) {
        await api.post(`${ApiRoute.Favorite}/${id}`);
      } else {
        await api.delete(`${ApiRoute.Favorite}/${id}`);
      }

      const { data } = await api.get<ApiOffer>(`${ApiRoute.Offers}/${id}`);

      return mapApiOffer(data);
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === HttpCode.NoAuth) {
        history.push(AppRoute.Login);
      }

      return Promise.reject(error);
    }
  });

