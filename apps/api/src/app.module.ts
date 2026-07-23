import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AttachmentsModule } from './attachments/attachments.module';
import { AuthModule } from './auth/auth.module';
import { SessionAuthGuard } from './auth/guards/session-auth.guard';
import {
  DEFAULT_RATE_LIMIT_MAX_REQUESTS,
  DEFAULT_RATE_LIMIT_TTL_MS,
} from './common/constants/auth.constants';
import { CsrfOriginGuard } from './common/guards/csrf-origin.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { ContactsModule } from './contacts/contacts.module';
import { CyclesModule } from './cycles/cycles.module';
import { DealsModule } from './deals/deals.module';
import { HealthModule } from './health/health.module';
import { NotesModule } from './notes/notes.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { PartnersModule } from './partners/partners.module';
import { PrismaModule } from './prisma/prisma.module';
import { ToonExpoModule } from './toonexpo/toonexpo.module';
import { UsersModule } from './users/users.module';
import { VenueMapModule } from './venue-map/venue-map.module';

@Module({
  imports: [
    PrismaModule,
    ThrottlerModule.forRoot([
      { name: 'default', ttl: DEFAULT_RATE_LIMIT_TTL_MS, limit: DEFAULT_RATE_LIMIT_MAX_REQUESTS },
    ]),
    HealthModule,
    AuthModule,
    UsersModule,
    CyclesModule,
    OrganizationsModule,
    ContactsModule,
    DealsModule,
    PartnersModule,
    NotesModule,
    AttachmentsModule,
    VenueMapModule,
    ToonExpoModule,
  ],
  providers: [
    // Order matters: rate limit, then CSRF origin check, then session auth, then role check.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: CsrfOriginGuard },
    { provide: APP_GUARD, useClass: SessionAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
