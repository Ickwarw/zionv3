import { useState } from 'react';
import { configService } from '../../../services/api';
import { showWarningAlert } from '@/components/ui/alert-dialog-warning';
import { showErrorAlert } from '@/components/ui/alert-dialog-error';
import { formatAxiosError } from '@/components/ui/formatResponseError';


export const confService = () => {
  
  const saveConfig = async (key: string, value: string) => {
    try {
      const response = await configService.createConfig(key=key, value=value);
      if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível salvar a Configuração", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível salvar a Configuração", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to create Config:', error);
        showErrorAlert('Erro ao Salvar a Configuração', formatAxiosError(error));
    }
  }

  const updateConfig = async (key: string, value: string) => {
    try {
      const response = await configService.updateConfig(key=key, value=value);
      if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível atualizar a Configuração", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível atualizar a Configuração", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to update Config:', error);
        showErrorAlert('Erro ao atualizar a Configuração', formatAxiosError(error));
    }
  }

  const handleSaveConfig = (id: number, key: string, value: string) => {
    if (value == null || value.trim() === '') {
      return;
    }
    if (id == null) {
      saveConfig(key, value);
    } else {
      updateConfig(key, value);
    }
  }

  const saveConfigApis = async (configApis) => {
    try {
      const response = await configService.createConfigAPIs(configApis);
      if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível salvar a Configuração", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível salvar a Configuração", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to create Config:', error);
        showErrorAlert('Erro ao Salvar a Configuração', formatAxiosError(error));
    }
  }


  // const saveWithError = async (key: string, value: string) => {
  //   console.log("Antes de enviar'");
  //   const response = await configService.createConfig(key=key, value=value);
  //   console.log("Depois de enviar'");
  //   console.log(response.status);
  //   if (response.status != 200 && response.status != 201) {
  //     throw new Error("Não foi possível Criar a Config");
  //   }
  // }

  // const saveOrUpdate = (key: string, value: string) => {
  //   try {
  //     saveWithError(key, value);
  //     console.log('Adasdas')
  //   } catch {
  //     console.log("ADASDA");
  //     updateConfig(key, value);
  //   }
  // }

  return {
    handleSaveConfig,
    saveConfigApis
    // saveOrUpdate
  };
};