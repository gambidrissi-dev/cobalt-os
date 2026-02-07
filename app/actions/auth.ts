"use server";

import { 
  loginAction as serviceLogin, 
  updatePasswordAction as serviceUpdatePassword, 
  createFirstAdmin as serviceCreateFirstAdmin, 
  logoutAction as serviceLogout, 
  getCurrentUser as serviceGetCurrentUser, 
  getActiveEntity as serviceGetActiveEntity, 
  switchEntityAction as serviceSwitchEntity 
} from "@/app/services/auth";

export async function loginAction(formData: FormData) {
  return serviceLogin(formData);
}

export async function updatePasswordAction(formData: FormData) {
  return serviceUpdatePassword(formData);
}

export async function createFirstAdmin(formData: FormData) {
  return serviceCreateFirstAdmin(formData);
}

export async function logoutAction() {
  return serviceLogout();
}

export async function getCurrentUser() {
  return serviceGetCurrentUser();
}

export async function getActiveEntity() {
  return serviceGetActiveEntity();
}

export async function switchEntityAction(entity: string) {
  return serviceSwitchEntity(entity);
}