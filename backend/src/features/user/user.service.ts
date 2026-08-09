import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      email: createUserDto.email,
      password: hashedPassword,
      age: createUserDto.age,
      countryOriginId: createUserDto.countryOriginId,
      roles: 'user',
    });

    return await this.userRepository.save(user);
  }


  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponseDto<User>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      relations: ['originCountry'],
      skip,
      take: limit,
      order: { idUser: 'DESC' },
    });

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { idUser: id },
      relations: ['originCountry'],
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);

    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async updateRole(id: number, role: string): Promise<User> {
    const user = await this.findOne(id);
    user.roles = role;
    return await this.userRepository.save(user);
  }

  // How many users currently hold any of the given roles (e.g. admin-level roles).
  async countByRoles(roles: string[]): Promise<number> {
    return this.userRepository.count({ where: { roles: In(roles) } });
  }

  async getStats(): Promise<{ totalUsers: number }> {
    const totalUsers = await this.userRepository.count();
    return { totalUsers };
  }

  // ── F1 : réseau d'experts vérifiés ──────────────────────────────

  /** Forme publique d'un expert — JAMAIS l'email. */
  private toExpertPublic(u: User) {
    return {
      idUser: u.idUser,
      fullName: [u.firstName, u.lastName].filter(Boolean).join(' '),
      expertTitle: u.expertTitle ?? null,
      expertBio: u.expertBio ?? null,
      expertCountry: u.expertCountry
        ? {
            idCountry: u.expertCountry.idCountry,
            countryName: u.expertCountry.countryName,
          }
        : null,
      expertVerifiedAt: u.expertVerifiedAt ?? null,
      // averageRating / ratingCount seront renseignés par F4.
    };
  }

  /** Experts VÉRIFIÉS (isExpert = true ET expertVerifiedAt non nul), filtrables. */
  async findExperts(countryId?: number, q?: string) {
    const qb = this.userRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.expertCountry', 'country')
      .where('u.isExpert = :ex', { ex: true })
      .andWhere('u.expertVerifiedAt IS NOT NULL');

    if (countryId) {
      qb.andWhere('u.expertCountryId = :cid', { cid: countryId });
    }
    if (q && q.trim()) {
      qb.andWhere(
        '(u.firstName ILIKE :q OR u.lastName ILIKE :q OR u.expertTitle ILIKE :q OR u.expertBio ILIKE :q)',
        { q: `%${q.trim()}%` },
      );
    }
    const users = await qb.orderBy('u.expertVerifiedAt', 'DESC').getMany();
    return users.map((u) => this.toExpertPublic(u));
  }

  /** Vérifie un expert (admin) : renseigne titre/bio/pays + horodatage + vérificateur. */
  async verifyExpert(
    id: number,
    dto: { expertTitle?: string; expertBio?: string; expertCountryId?: number },
    verifiedById: number,
  ): Promise<User> {
    const user = await this.findOne(id);
    user.isExpert = true;
    if (dto.expertTitle !== undefined) user.expertTitle = dto.expertTitle;
    if (dto.expertBio !== undefined) user.expertBio = dto.expertBio;
    if (dto.expertCountryId !== undefined)
      user.expertCountryId = dto.expertCountryId;
    user.expertVerifiedAt = new Date();
    user.expertVerifiedBy = verifiedById;
    return this.userRepository.save(user);
  }

  /** Révoque la vérification d'un expert (admin). */
  async revokeExpert(id: number): Promise<User> {
    const user = await this.findOne(id);
    user.isExpert = false;
    user.expertVerifiedAt = null;
    user.expertVerifiedBy = null;
    return this.userRepository.save(user);
  }

  /**
   * Un expert modifie son propre titre/bio — SANS jamais toucher au statut de
   * vérification (isExpert / expertVerifiedAt / expertVerifiedBy).
   */
  async updateExpertProfile(
    id: number,
    dto: { expertTitle?: string; expertBio?: string },
  ): Promise<User> {
    const user = await this.findOne(id);
    if (!user.isExpert || !user.expertVerifiedAt) {
      throw new ForbiddenException(
        "Vous n'êtes pas un expert vérifié.",
      );
    }
    if (dto.expertTitle !== undefined) user.expertTitle = dto.expertTitle;
    if (dto.expertBio !== undefined) user.expertBio = dto.expertBio;
    return this.userRepository.save(user);
  }
}
