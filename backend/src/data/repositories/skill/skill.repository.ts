import { CommonKey, UserToSkillKey } from 'common/enums/enums';
import { IUserToSkillRecord } from 'common/interfaces/interfaces';
import { Transaction } from 'common/types/types';
import { Skill as SkillModel } from 'data/models/models';

type Constructor = {
  SkillModel: typeof SkillModel;
};

class Skill {
  private _SkillModel: typeof SkillModel;

  public constructor(params: Constructor) {
    this._SkillModel = params.SkillModel;
  }

  public async getAllIds(
    trx?: Transaction,
  ): Promise<Pick<IUserToSkillRecord, UserToSkillKey.SKILL_ID>[]> {
    return this._SkillModel
      .query(trx)
      .select(`${CommonKey.ID} as ${UserToSkillKey.SKILL_ID}`)
      .castTo<Pick<IUserToSkillRecord, UserToSkillKey.SKILL_ID>[]>();
  }
}
export { Skill };
