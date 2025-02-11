/**
 * @ Author: AbdullahCXD
 * @ Create Time: 2025-02-10 19:11:43
 * @ Modified by: AbdullahCXD
 * @ Modified time: 2025-02-10 21:24:58
 */

export interface IHandler<T> {

    load(dir: string): T[];

}