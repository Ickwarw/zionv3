import React, { useState, useEffect } from 'react';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { DadosEmpresaProps } from '../types/cadastro-fornecedor.types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Country, State, City } from "country-state-city";
import { useForm } from 'react-hook-form';
import { useHookFormMask, withMask } from 'use-mask-input';


const DadosEmpresa = ({ formData, setFormData, onElementClick, isJuliaActive }: DadosEmpresaProps) => {
  const [country, setCountry] = useState("BR"); // Brasil default
  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  const countries = Country.getAllCountries();
  const states = country ? State.getStatesOfCountry(country) : [];
  const cities = country && state ? City.getCitiesOfState(country, state) : [];
  const { register, handleSubmit } = useForm();
  const registerWithMask = useHookFormMask(register);

  useEffect(() => {
    setFormData({
      ...formData,
      country : country
    })
  }, []);

  return (
    <div className="space-y-4">
      <h3 
        onClick={(e) => onElementClick(e, "Seção com os dados principais da empresa fornecedora!")}
        className={`text-lg font-semibold text-gray-900 ${isJuliaActive ? 'cursor-help' : ''}`}
      >
        Dados da Empresa
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label 
            onClick={(e) => onElementClick(e, "Nome da empresa!")}
            className={isJuliaActive ? 'cursor-help' : ''}
          >
            Nome *
          </Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Nome oficial da empresa"
            required
          />
        </div>

        <div>
          <Label 
            onClick={(e) => onElementClick(e, "Telefone principal da empresa!")}
            className={isJuliaActive ? 'cursor-help' : ''}
          >
            Telefone Principal
          </Label>
          <Input
            value={formData.phone}
            type="tel"
            // ref={withMask('(99) [9]9999-9999')}
            {...registerWithMask("phone", ['(99) 9999-9999', '(99) 99999-9999'], {
              required: true
            })}
            // pattern="([0-9]{2})[0-9]{4}-[0-9]{3}-[0-9]{4}"
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="(00) 0000-0000"
          />
        </div>

        <div>
          <Label 
            onClick={(e) => onElementClick(e, "Email principal da empresa!")}
            className={isJuliaActive ? 'cursor-help' : ''}
          >
            Email Principal
          </Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="contato@empresa.com"
          />
        </div>

        <div>
          <Label 
            onClick={(e) => onElementClick(e, "Contato principal da empresa!")}
            className={isJuliaActive ? 'cursor-help' : ''}
          >
            Contato Principal
          </Label>
          <Input
            value={formData.contact_person}
            onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
          />
        </div>

        <div>
          <Label 
            onClick={(e) => onElementClick(e, "Paíso do fornecedor!")}
            className={isJuliaActive ? 'cursor-help' : ''}
          >
            País
          </Label>
          <Select 
              value={formData.country ?? ""}
              onValueChange={(value) => {
                setFormData({
                  ...formData,
                  country: value
                });
                setCountry(value);
                setState("");
                setCity("");
              }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o país" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((pais) => (
                <SelectItem key={pais.isoCode} value={pais.isoCode}>
                  {pais.name}
                </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label 
            onClick={(e) => onElementClick(e, "Estado do fornecedor!")}
            className={isJuliaActive ? 'cursor-help' : ''}
          >
            Estado
          </Label>
          {states.length > 0 ? (
            <Select 
                value={formData.state ?? ""}
                onValueChange={(value) => {
                  setFormData({
                    ...formData,
                    state: value
                  });
                  setState(value);
                  setCity("");
                }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state.isoCode} value={state.isoCode}>
                    {state.name}
                  </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
            ) : (<Input
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
              />
          )}
        </div>

        <div>
          <Label 
            onClick={(e) => onElementClick(e, "Cidade do fornecedor!")}
            className={isJuliaActive ? 'cursor-help' : ''}
          >
            Cidade
          </Label>
          {cities.length > 0 ? (
            <Select 
                value={formData.city ?? ""}
                onValueChange={(value) => {
                  setFormData({
                    ...formData,
                    city: value
                  });
                  setCity(value);
                }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a Cidade" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((c) => (
                  <SelectItem key={`${c.countryCode}-${c.stateCode}-${c.name}`} value={c.name}>
                    {c.name}
                  </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
            ) : (<Input
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
              />
          )}
        </div>

        <div>
          <Label 
            onClick={(e) => onElementClick(e, "Endereço completo da empresa!")}
            className={isJuliaActive ? 'cursor-help' : ''}
          >
            Endereço
          </Label>
          <Input
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            placeholder="Endereço completo"
          />
        </div>

        <div>
          <Label 
            onClick={(e) => onElementClick(e, "CEP da empresa!")}
            className={isJuliaActive ? 'cursor-help' : ''}
          >
            CEP
          </Label>
          <Input
            ref={withMask('99999-999')}
            value={formData.zip_code}
            onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
          />
        </div>

        <div>
          <Label 
            onClick={(e) => onElementClick(e, "Site da empresa!")}
            className={isJuliaActive ? 'cursor-help' : ''}
          >
            Site
          </Label>
          <Input
            value={formData.website}
            onChange={(e) => setFormData({...formData, website: e.target.value})}
          />
        </div>


      </div>
    </div>
  );
};

export default DadosEmpresa;
