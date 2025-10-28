import type { AxiosRequestConfig } from "axios";

import { api } from "@/lib/axios";
import type { Paginated, QueryOptions } from "@/lib/pagination";
import { buildQuery } from "@/lib/pagination";

export class BaseService<TResource extends string> {
  constructor(private readonly resource: TResource) {}

  protected get client() {
    return api;
  }

  protected buildQueryString(options?: QueryOptions): string {
    const params = buildQuery(options);
    const query = params.toString();
    return query ? `?${query}` : "";
  }

  protected buildUrl(path?: string | number): string {
    if (path === undefined || path === null) {
      return `/${this.resource}`;
    }
    return `/${this.resource}/${path}`;
  }

  async list<T>(options?: QueryOptions, config?: AxiosRequestConfig) {
    const url = `${this.buildUrl()}${this.buildQueryString(options)}`;
    const response = await this.client.get<Paginated<T>>(url, config);
    return response.data;
  }

  async show<T>(id: string | number, config?: AxiosRequestConfig) {
    const response = await this.client.get<T>(this.buildUrl(id), config);
    return response.data;
  }

  async create<TBody, TResult>(body: TBody, config?: AxiosRequestConfig) {
    const response = await this.client.post<TResult>(this.buildUrl(), body, config);
    return response.data;
  }

  async update<TBody, TResult>(id: string | number, body: TBody, config?: AxiosRequestConfig) {
    const response = await this.client.put<TResult>(this.buildUrl(id), body, config);
    return response.data;
  }

  async patch<TBody, TResult>(id: string | number, body: TBody, config?: AxiosRequestConfig) {
    const response = await this.client.patch<TResult>(this.buildUrl(id), body, config);
    return response.data;
  }

  async delete<TResult>(id: string | number, config?: AxiosRequestConfig) {
    const response = await this.client.delete<TResult>(this.buildUrl(id), config);
    return response.data;
  }
}
