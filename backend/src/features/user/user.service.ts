import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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

    const fullName = `${createUserDto.firstName} ${createUserDto.lastName}`;

    const user = this.userRepository.create({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      fullName: fullName,
      email: createUserDto.email,
      passwordHash: hashedPassword,
      age: createUserDto.age,
      status: createUserDto.status,
      languageLevel: createUserDto.languageLevel,
      motherTongue: createUserDto.motherTongue,
      spokenLanguages: createUserDto.spokenLanguages,
      idOriginCountry: createUserDto.idOriginCountry,
      userRole: 'user',
    });

    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      relations: ['originCountry'],
    });
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

    if (updateUserDto.firstName || updateUserDto.lastName) {
      const firstName = updateUserDto.firstName || user.firstName || '';
      const lastName = updateUserDto.lastName || user.lastName || '';
      updateUserDto['fullName'] = `${firstName} ${lastName}`.trim();
    }

    if (updateUserDto.password) {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      Object.assign(user, { ...updateUserDto, passwordHash: hashedPassword });
    } else {
      Object.assign(user, updateUserDto);
    }

    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
